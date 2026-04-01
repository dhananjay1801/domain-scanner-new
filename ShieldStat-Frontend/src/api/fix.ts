import { apiFetch } from './config';

export interface FixRequest {
  scan_id: string;
  domain: string;
  fix_type: string;
  data: any;
}

export interface FixResponse {
  message: string;
  scan_id: string;
  reload: boolean;
}

export const VULN_NAME_TO_FIX_TYPE: Record<string, string> = {
  // Network Security
  "Unexpected open port": "unexpected_port",
  "Risky port exposed": "risky_port",

  // App Security
  "Missing CSP header": "missing_csp",
  "Missing HSTS header": "missing_hsts",
  "Missing X-Frame-Options": "missing_x_frame",
  "Missing X-Content-Type-Options": "missing_x_content",
  "HTTP without HTTPS": "http_without_https",

  // TLS Security
  "Expired TLS": "expired_tls",
  "Weak TLS version": "weak_tls",
  "443 open without TLS": "tls_missing_443",

  // DNS Security
  "Missing NS record": "missing_ns",
  "Missing MX record": "missing_mx",
  "Missing TXT record": "missing_txt",
  "Duplicate SPF record": "duplicate_spf",
  "Weak SPF policy": "weak_spf",
  "Missing SPF record": "missing_spf",
  "Missing DMARC": "missing_dmarc",
  "Weak DMARC policy": "weak_dmarc",
  "Missing DKIM": "missing_dkim",
};

export const CATEGORY_TO_FIX_CATEGORY: Record<string, string> = {
  "Application Security": "app_security",
  "Network Security": "network_security",
  "TLS Security": "tls_security",
  "DNS Security": "dns_security",
  "DNS Health": "dns_security", // Added mapping for UI "DNS Health"
};

/**
 * Submits a fix request to the backend.
 * This will queue the fix for the scanner to process.
 */
export async function submitFix(request: FixRequest): Promise<FixResponse> {
  return apiFetch<FixResponse>('/api/fix/submit', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
