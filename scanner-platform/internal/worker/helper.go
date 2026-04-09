package worker

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"scanner-platform/internal/models"
	"strings"
)

func postJSON(url string, payload any) (string, error) {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	res, err := http.Post(
		url,
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	body, readErr := io.ReadAll(res.Body)
	if readErr != nil {
		return "", readErr
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		detail := strings.TrimSpace(string(body))
		if detail == "" {
			detail = http.StatusText(res.StatusCode)
		}
		return "", fmt.Errorf("%s returned %s: %s", url, res.Status, detail)
	}

	return res.Status, nil
}

func send_webhook_notification(payload models.ScanNotification) (string, error) {
	url := "http://scanner-backend:8000/webhooks/scan/notification"
	return postJSON(url, payload)
}

func send_scan_result_webhook(payload models.ScanResult) (string, error) {
	url := "http://scanner-backend:8000/webhooks/scan/result"
	return postJSON(url, payload)
}


func send_fix_result_webhook(payload models.FixScanResult) (string, error) {
	url := "http://scanner-backend:8000/fix/result"
	return postJSON(url, payload)
}
