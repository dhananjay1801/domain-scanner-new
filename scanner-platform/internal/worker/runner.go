package worker

import (
	"context"
	"fmt"
	"log"
	"time"

	"scanner-platform/internal/models"
	"scanner-platform/scanner-engine/core"
	"scanner-platform/scanner-engine/scanners/collection"
	"scanner-platform/scanner-engine/scanners/discovery"
	"scanner-platform/scanner-engine/scanners/filters"
)

func Run(ctx context.Context, job *models.ScanJob) (any, error) {

	log.Printf("Scan started: %s (%s)", job.ScanID, job.Target)

	fmt.Println("Pipeline started for domain:", job.Target)

	fmt.Println("Pipeline 1 : subdomain discovery")

	registry := core.NewRegistry()

	registry.Register(discovery.NewCrtCTScanner())
	registry.Register(discovery.NewCertSpotterCTScanner())
	registry.Register(discovery.NewSubdomainBruteforceScanner())
	registry.Register(discovery.NewSubdomainSubFinderScanner())

	pipeline := core.NewDiscoveryPipeline(registry)

	results, err := pipeline.ExecuteDiscoveryScanner(ctx, job.Target)
	if err != nil {
		return nil, err
	}

	discovery_payload := models.ScanNotification{
		ScanID: job.ScanID,
		Target: job.Target,
		Event:  "subdomain_discovery_completed",
		Status: "completed",
	}
	discovery_res, err := send_webhook_notification(discovery_payload)
	if err != nil {
		log.Printf("Failed to send webhook notification: %v", err)
	}

	fmt.Println("Total Subdomains Found:", len(results.Data.([]string)), discovery_res)

	fmt.Println("Pipeline 2 : filter subdomain")

	filter_registry := core.NewFilterScannerRegistry()

	filter_registry.RegisterFilterScanner(filters.NewDedupFilter())
	filter_registry.RegisterFilterScanner(filters.NewDNSFilter())
	filter_registry.RegisterFilterScanner(filters.NewHTTPFilter())

	filter_pipeline := core.NewFilterPipeline(filter_registry)

	filter_pipeline_results, err := filter_pipeline.ExecuteFilterScanners(ctx, results, job.Target)
	if err != nil {
		return nil, err
	}

	filter_payload := models.ScanNotification{
		ScanID: job.ScanID,
		Target: job.Target,
		Event:  "subdomain_filter_completed",
		Status: "completed",
	}
	filter_res, err := send_webhook_notification(filter_payload)
	if err != nil {
		log.Printf("Failed to send webhook notification: %v", err)
	}

	fmt.Println("Total Filtered Subdomains Found:", len(filter_pipeline_results.Data.([]interface{})), filter_res)

	// Ensure root domain is in the list for collection
	foundRoot := false
	targetDomain := job.Target
	if subs, ok := filter_pipeline_results.Data.([]interface{}); ok {
		for _, s := range subs {
			if m, ok := s.(map[string]any); ok {
				if m["subdomain"] == targetDomain {
					foundRoot = true
					break
				}
			}
		}
		if !foundRoot {
			filter_pipeline_results.Data = append(subs, map[string]any{"subdomain": targetDomain})
		}
	}

	fmt.Println("Scanner 3 : Data collection")

	collection_registry := core.NewCollectionRegistry()

	collection_registry.RegisterCollectionScanner(collection.NewDNSDataOutput())
	collection_registry.RegisterCollectionScanner(collection.NewHTTPXFilterOutput())
	collection_registry.RegisterCollectionScanner(collection.NewPortFilter())
	collection_registry.RegisterCollectionScanner(collection.NewTLSDataCollection())
	collection_registry.RegisterCollectionScanner(collection.NewMailSecurityDataCollection())

	collection_pipeline := core.NewCollectionPipeline(collection_registry)

	collection_data_results, err := collection_pipeline.ExecuteCollectionScanenrs(ctx, filter_pipeline_results, job.Target)
	if err != nil {
		return nil, err
	}

	collection_payload := models.ScanNotification{
		ScanID: job.ScanID,
		Target: job.Target,
		Event:  "subdomain_collection_completed",
		Status: "completed",
	}

	_, err = send_webhook_notification(collection_payload)
	if err != nil {
		log.Printf("Failed to send webhook notification: %v", err)
	}

	// Structure data for backend: separate host and subdomains
	var hostData map[string]interface{}
	var subdomainsData []interface{}

	if results, ok := collection_data_results.Data.([]interface{}); ok {
		for _, item := range results {
			if m, ok := item.(map[string]interface{}); ok {
				if m["subdomain"] == targetDomain {
					hostData = m
					// Also include in subdomains as the "apex" entry
					subdomainsData = append(subdomainsData, m)
				} else {
					subdomainsData = append(subdomainsData, m)
				}
			}
		}
	}

	if hostData == nil {
		hostData = map[string]interface{}{"domain": targetDomain}
	} else {
		hostData["domain"] = targetDomain
	}

	scanResult := models.ScanResult{
		ScanID:    job.ScanID,
		Target:    job.Target,
		Data:      map[string]interface{}{
			"host":       hostData,
			"subdomains": subdomainsData,
		},
		Timestamp: time.Now(),
	}
	fmt.Println("Final Results:", len(subdomainsData), "subdomains sent")

	res, err := send_scan_result_webhook(scanResult)

	return res, nil
}
