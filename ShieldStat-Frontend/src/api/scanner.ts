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
  try {
    return await apiFetch<ScanHistoryItem[]>('/scanner/scan-history', {
      method: 'GET',
    });
  } catch (error: any) {
    if (error?.status === 404) {
      return apiFetch<ScanHistoryItem[]>('/scanner/history', {
        method: 'GET',
      });
    }
    throw error;
  }
}
