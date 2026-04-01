package worker

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os/exec"
	"strings"
	"time"

	"scanner-platform/internal/models"
)

// RunFix processes a fix job by verifying if the issue is actually resolved.
// It runs targeted probes (naabu, httpx, dnsx) depending on the fix_type.
// Returns true only if the issue is confirmed fixed.
func RunFix(ctx context.Context, job *models.FixJob) error {
	log.Printf("Fix verification started: scan=%s domain=%s type=%s subdomain=%s",
		job.ScanID, job.Domain, job.FixType, job.Data.Subdomain)

	fixed := false
	var err error

	switch job.FixType {
	// --- Network Security ---
	case "unexpected_port", "risky_port":
		fixed, err = verifyPortClosed(ctx, job.Data.Subdomain, job.Data.Port)

	// --- App Security ---
	case "missing_csp":
		fixed, err = verifyHTTPHeader(ctx, job.Data.Subdomain, "content-security-policy")
	case "missing_hsts":
		fixed, err = verifyHTTPHeader(ctx, job.Data.Subdomain, "strict-transport-security")
	case "missing_x_frame":
		fixed, err = verifyHTTPHeader(ctx, job.Data.Subdomain, "x-frame-options")
	case "missing_x_content":
		fixed, err = verifyHTTPHeader(ctx, job.Data.Subdomain, "x-content-type-options")
	case "http_without_https":
		fixed, err = verifyHTTPS(ctx, job.Data.Subdomain)

	// --- TLS Security ---
	case "expired_tls":
		fixed, err = verifyTLSNotExpired(ctx, job.Data.Subdomain)
	case "weak_tls":
		fixed, err = verifyTLSVersion(ctx, job.Data.Subdomain)
	case "tls_missing_443":
		fixed, err = verifyTLSOn443(ctx, job.Data.Subdomain)

	// --- DNS Security ---
	case "missing_spf":
		fixed, err = verifyDNSRecord(ctx, job.Data.Subdomain, "txt", "v=spf1")
	case "missing_dmarc":
		fixed, err = verifyDNSRecord(ctx, "_dmarc."+job.Data.Subdomain, "txt", "v=DMARC1")
	case "missing_dkim":
		fixed, err = verifyDKIM(ctx, job.Data.Subdomain)
	case "missing_ns":
		fixed, err = verifyDNSExists(ctx, job.Data.Subdomain, "ns")
	case "missing_mx":
		fixed, err = verifyDNSExists(ctx, job.Data.Subdomain, "mx")
	case "missing_txt":
		fixed, err = verifyDNSExists(ctx, job.Data.Subdomain, "txt")
	case "duplicate_spf":
		fixed, err = verifySingleSPF(ctx, job.Data.Subdomain)
	case "weak_spf":
		fixed, err = verifyStrongSPF(ctx, job.Data.Subdomain)
	case "weak_dmarc":
		fixed, err = verifyStrongDMARC(ctx, job.Data.Subdomain)

	default:
		log.Printf("Unknown fix_type: %s, marking as not fixed", job.FixType)
		fixed = false
	}

	if err != nil {
		log.Printf("Verification error for %s: %v (marking as not fixed)", job.FixType, err)
		fixed = false
	}

	if fixed {
		log.Printf("✅ Issue RESOLVED: scan=%s type=%s subdomain=%s", job.ScanID, job.FixType, job.Data.Subdomain)
	} else {
		log.Printf("❌ Issue NOT resolved: scan=%s type=%s subdomain=%s", job.ScanID, job.FixType, job.Data.Subdomain)
	}

	fixResult := models.FixResult{
		ScanID:  job.ScanID,
		Domain:  job.Data.Subdomain,
		FixType: job.FixType,
		Result:  fixed,
	}

	res, err := send_fix_result_webhook(fixResult)
	if err != nil {
		log.Printf("Failed to send fix result webhook: %v", err)
		return err
	}

	log.Printf("Fix result sent for scan=%s type=%s fixed=%v: %v", job.ScanID, job.FixType, fixed, res)
	return nil
}

// ==================== Network Verification ====================

func verifyPortClosed(ctx context.Context, subdomain string, port *int) (bool, error) {
	if port == nil {
		return false, fmt.Errorf("no port specified for port check")
	}

	portStr := fmt.Sprintf("%d", *port)
	log.Printf("Checking if port %s is closed on %s", portStr, subdomain)

	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "naabu", "-host", subdomain, "-p", portStr, "-silent")
	output, err := cmd.Output()
	if err != nil {
		// naabu returns non-zero if no ports found — that means port is closed (good)
		if exitErr, ok := err.(*exec.ExitError); ok {
			log.Printf("naabu exited with code %d (port likely closed)", exitErr.ExitCode())
			return true, nil
		}
		return false, fmt.Errorf("naabu execution error: %w", err)
	}

	// If output contains the port, it's still open
	lines := strings.TrimSpace(string(output))
	if lines == "" {
		return true, nil // No output = port closed
	}

	// Check if the specific port appears in output
	for _, line := range strings.Split(lines, "\n") {
		if strings.Contains(line, portStr) {
			return false, nil // Port still open
		}
	}

	return true, nil
}

// ==================== HTTP Header Verification ====================

func verifyHTTPHeader(ctx context.Context, subdomain string, headerName string) (bool, error) {
	log.Printf("Checking HTTP header '%s' on %s", headerName, subdomain)

	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "httpx",
		"-u", subdomain,
		"-silent", "-json",
		"-include-response-header",
	)

	output, err := cmd.Output()
	if err != nil {
		return false, fmt.Errorf("httpx execution error: %w", err)
	}

	lines := strings.TrimSpace(string(output))
	if lines == "" {
		return false, fmt.Errorf("no httpx output for %s", subdomain)
	}

	// Parse each JSON line
	for _, line := range strings.Split(lines, "\n") {
		var result map[string]interface{}
		if err := json.Unmarshal([]byte(line), &result); err != nil {
			continue
		}

		// Check response headers
		if headers, ok := result["header"].(map[string]interface{}); ok {
			headerLower := strings.ToLower(headerName)
			for k := range headers {
				if strings.ToLower(k) == headerLower {
					return true, nil // Header found
				}
			}
		}
	}

	return false, nil // Header not found
}

func verifyHTTPS(ctx context.Context, subdomain string) (bool, error) {
	log.Printf("Checking HTTPS availability on %s", subdomain)

	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "httpx",
		"-u", "https://"+subdomain,
		"-silent", "-json",
	)

	output, err := cmd.Output()
	if err != nil {
		return false, fmt.Errorf("httpx execution error: %w", err)
	}

	lines := strings.TrimSpace(string(output))
	if lines == "" {
		return false, nil // HTTPS not reachable
	}

	for _, line := range strings.Split(lines, "\n") {
		var result map[string]interface{}
		if err := json.Unmarshal([]byte(line), &result); err != nil {
			continue
		}
		if scheme, ok := result["scheme"].(string); ok && scheme == "https" {
			return true, nil
		}
	}

	return false, nil
}

// ==================== TLS Verification ====================

func verifyTLSNotExpired(ctx context.Context, subdomain string) (bool, error) {
	log.Printf("Checking TLS certificate expiry on %s", subdomain)

	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "tlsx",
		"-u", subdomain,
		"-silent", "-json",
	)

	output, err := cmd.Output()
	if err != nil {
		return false, fmt.Errorf("tlsx execution error: %w", err)
	}

	lines := strings.TrimSpace(string(output))
	for _, line := range strings.Split(lines, "\n") {
		var result map[string]interface{}
		if err := json.Unmarshal([]byte(line), &result); err != nil {
			continue
		}
		if expired, ok := result["expired"].(bool); ok {
			return !expired, nil // Fixed if NOT expired
		}
	}

	return false, fmt.Errorf("no TLS data from tlsx for %s", subdomain)
}

func verifyTLSVersion(ctx context.Context, subdomain string) (bool, error) {
	log.Printf("Checking TLS version on %s", subdomain)

	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "tlsx",
		"-u", subdomain,
		"-silent", "-json",
	)

	output, err := cmd.Output()
	if err != nil {
		return false, fmt.Errorf("tlsx execution error: %w", err)
	}

	weakVersions := map[string]bool{"tls10": true, "tls11": true}

	lines := strings.TrimSpace(string(output))
	for _, line := range strings.Split(lines, "\n") {
		var result map[string]interface{}
		if err := json.Unmarshal([]byte(line), &result); err != nil {
			continue
		}
		if version, ok := result["tls_version"].(string); ok {
			normalized := strings.ToLower(strings.ReplaceAll(version, ".", ""))
			normalized = strings.ReplaceAll(normalized, " ", "")
			if weakVersions[normalized] {
				return false, nil // Still weak
			}
			return true, nil // Strong TLS
		}
	}

	return false, fmt.Errorf("no TLS version data from tlsx for %s", subdomain)
}

func verifyTLSOn443(ctx context.Context, subdomain string) (bool, error) {
	log.Printf("Checking TLS on port 443 for %s", subdomain)

	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "tlsx",
		"-u", subdomain+":443",
		"-silent", "-json",
	)

	output, err := cmd.Output()
	if err != nil {
		return false, nil // No TLS on 443
	}

	lines := strings.TrimSpace(string(output))
	for _, line := range strings.Split(lines, "\n") {
		var result map[string]interface{}
		if err := json.Unmarshal([]byte(line), &result); err != nil {
			continue
		}
		if probeStatus, ok := result["probe_status"].(bool); ok && probeStatus {
			return true, nil // TLS is working on 443
		}
	}

	return false, nil
}

// ==================== DNS Verification ====================

func verifyDNSRecord(ctx context.Context, domain string, recordType string, contains string) (bool, error) {
	log.Printf("Checking DNS %s record for %s (looking for '%s')", recordType, domain, contains)

	timeoutCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "dnsx",
		"-d", domain,
		"-"+recordType,
		"-silent", "-json", "-resp",
	)

	output, err := cmd.Output()
	if err != nil {
		// Also try Go's native resolver as fallback
		return verifyDNSRecordNative(domain, recordType, contains)
	}

	lines := strings.TrimSpace(string(output))
	for _, line := range strings.Split(lines, "\n") {
		if strings.Contains(strings.ToLower(line), strings.ToLower(contains)) {
			return true, nil
		}
	}

	return false, nil
}

func verifyDNSRecordNative(domain string, recordType string, contains string) (bool, error) {
	switch recordType {
	case "txt":
		records, err := net.LookupTXT(domain)
		if err != nil {
			return false, nil
		}
		for _, r := range records {
			if strings.Contains(strings.ToLower(r), strings.ToLower(contains)) {
				return true, nil
			}
		}
	}
	return false, nil
}

func verifyDNSExists(ctx context.Context, domain string, recordType string) (bool, error) {
	log.Printf("Checking DNS %s record exists for %s", recordType, domain)

	timeoutCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	cmd := exec.CommandContext(timeoutCtx, "dnsx",
		"-d", domain,
		"-"+recordType,
		"-silent", "-resp",
	)

	output, err := cmd.Output()
	if err != nil {
		// Fallback to native resolver
		return verifyDNSExistsNative(domain, recordType)
	}

	lines := strings.TrimSpace(string(output))
	return lines != "", nil
}

func verifyDNSExistsNative(domain string, recordType string) (bool, error) {
	switch recordType {
	case "ns":
		records, err := net.LookupNS(domain)
		return err == nil && len(records) > 0, nil
	case "mx":
		records, err := net.LookupMX(domain)
		return err == nil && len(records) > 0, nil
	case "txt":
		records, err := net.LookupTXT(domain)
		return err == nil && len(records) > 0, nil
	}
	return false, fmt.Errorf("unsupported record type: %s", recordType)
}

func verifyDKIM(ctx context.Context, domain string) (bool, error) {
	// Common DKIM selectors to check
	selectors := []string{"default", "google", "selector1", "selector2", "k1", "s1", "dkim"}
	for _, sel := range selectors {
		dkimDomain := sel + "._domainkey." + domain
		found, _ := verifyDNSExists(ctx, dkimDomain, "txt")
		if found {
			return true, nil
		}
	}
	return false, nil
}

func verifySingleSPF(ctx context.Context, domain string) (bool, error) {
	log.Printf("Checking for duplicate SPF records on %s", domain)

	records, err := net.LookupTXT(domain)
	if err != nil {
		return false, nil
	}

	spfCount := 0
	for _, r := range records {
		if strings.HasPrefix(strings.ToLower(r), "v=spf1") {
			spfCount++
		}
	}

	return spfCount <= 1, nil // Fixed if 0 or 1 SPF records
}

func verifyStrongSPF(ctx context.Context, domain string) (bool, error) {
	log.Printf("Checking SPF policy strength on %s", domain)

	records, err := net.LookupTXT(domain)
	if err != nil {
		return false, nil
	}

	for _, r := range records {
		lower := strings.ToLower(r)
		if strings.HasPrefix(lower, "v=spf1") {
			// Weak if ends with ~all (softfail) or ?all (neutral)
			if strings.Contains(lower, "-all") {
				return true, nil // Hard fail = strong
			}
			return false, nil // Still weak
		}
	}

	return false, nil // No SPF at all
}

func verifyStrongDMARC(ctx context.Context, domain string) (bool, error) {
	log.Printf("Checking DMARC policy strength on %s", domain)

	dmarcDomain := "_dmarc." + domain
	records, err := net.LookupTXT(dmarcDomain)
	if err != nil {
		return false, nil
	}

	for _, r := range records {
		lower := strings.ToLower(r)
		if strings.HasPrefix(lower, "v=dmarc1") {
			scanner := bufio.NewScanner(strings.NewReader(lower))
			scanner.Split(bufio.ScanWords)

			// Check for p=reject (strongest policy)
			if strings.Contains(lower, "p=reject") {
				return true, nil
			}
			return false, nil // Still weak (none or quarantine)
		}
	}

	return false, nil
}
