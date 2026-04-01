package models

import "time"

type ScanJob struct {
	ScanID string `json:"scan_id"`
	Target string `json:"target"`
}

type FixData struct {
	Category  string `json:"category"`
	Subdomain string `json:"subdomain"`
	Port      *int   `json:"port,omitempty"`
}

type FixJob struct {
	ScanID  string  `json:"scan_id"`
	Domain  string  `json:"domain"`
	FixType string  `json:"fix_type"`
	Data    FixData `json:"data"`
}

type FixResult struct {
	ScanID  string `json:"scan_id"`
	Domain  string `json:"domain"`
	FixType string `json:"fix_type"`
	Result  bool   `json:"result"`
}

type ScanNotification struct {
	ScanID string `json:"scan_id"`
	Target string `json:"target"`
	Event  string `json:"event"`
	Status string `json:"status"`
}

type ScanResult struct {
	ScanID    string    `json:"scan_id"`
	Target    string    `json:"target"`
	Data      any       `json:"data"`
	Timestamp time.Time `json:"timestamp"`
}
