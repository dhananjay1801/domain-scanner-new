import { apiFetch } from './config';

export interface RegisterScanResponse {
  message: string;
  scan_id: string;
}

export interface ScanHistoryItem {
  scan_id: string;
  domain: string;
  time: string | null;
  score: number;
  status: string;
}

/**
 * Registers a new domain scan task in the backend queue.
 */
export async function registerScanTask(domain: string): Promise<RegisterScanResponse> {
  return apiFetch<RegisterScanResponse>('/scanner/register-scan-task', {
    method: 'POST',
    body: JSON.stringify({ target: domain }),
  });
}

/**
 * Fetches the raw scan result or stages of the scanner.
 * Used for polling until the score is ready.
 */
export async function getScanResult(scanId: string): Promise<any> {
    return apiFetch<any>(`/scanner/scan-result?scan_id=${scanId}`, {
        method: 'GET',
    });
}

/**
 * Retrieves the history of previous scans.
 */
export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  return apiFetch<ScanHistoryItem[]>('/scanner/scan-history', {
    method: 'GET',
  });
}
