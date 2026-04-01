ISSUE_METADATA = {
    "HTTP without HTTPS": {
        "threat_level": "Critical",
        "breach_risk": "Critical",
        "impact": 20,
        "description": "Traffic is served over unencrypted HTTP with no HTTPS redirect. All data — including credentials and session tokens — is transmitted in plain text.",
        "remediation": "Configure a permanent 301 redirect from HTTP to HTTPS and enable HSTS on all affected hosts.",
        "cvss": "9.1"
    },
    "443 open without TLS": {
        "threat_level": "Critical",
        "breach_risk": "Critical",
        "impact": 20,
        "description": "Port 443 is open but TLS is not properly configured. This means HTTPS connections will fail or expose traffic.",
        "remediation": "Provision a TLS certificate (Let's Encrypt is free) and configure the server to terminate TLS on port 443. Force HTTPS redirect on port 80.",
        "cvss": "9.8"
    },
    "Missing CSP header": {
        "threat_level": "High",
        "breach_risk": "High",
        "impact": 3,
        "description": "The Content-Security-Policy header is absent, leaving browsers unable to restrict which resources may be loaded. This enables XSS and data injection attacks.",
        "remediation": "Add a Content-Security-Policy header via your web server or CDN. A restrictive policy like default-src 'self' should be the baseline.",
        "cvss": "6.1"
    },
    "Missing HSTS header": {
        "threat_level": "High",
        "breach_risk": "High",
        "impact": 4,
        "description": "Strict-Transport-Security is missing despite TLS being present. Without HSTS, browsers may allow downgrade attacks, stripping HTTPS to HTTP.",
        "remediation": "Set Strict-Transport-Security: max-age=31536000; includeSubDomains on your server or CDN settings.",
        "cvss": "6.5"
    },
    "Missing X-Frame-Options": {
        "threat_level": "Medium",
        "breach_risk": "Medium",
        "impact": 2,
        "description": "The X-Frame-Options header is absent, leaving sites vulnerable to clickjacking attacks where a malicious page embeds your site in an invisible iframe.",
        "remediation": "Add X-Frame-Options: SAMEORIGIN (or DENY) to all HTTP responses across all subdomains.",
        "cvss": "5.4"
    },
    "Missing X-Content-Type-Options": {
        "threat_level": "Medium",
        "breach_risk": "Medium",
        "impact": 2,
        "description": "X-Content-Type-Options: nosniff is missing. Without it, browsers may perform MIME-type sniffing, which can allow certain injection attacks.",
        "remediation": "Add X-Content-Type-Options: nosniff globally via reverse proxy, CDN rules, or framework middleware.",
        "cvss": "4.3"
    },
    "Missing NS record": {
        "threat_level": "High",
        "breach_risk": "High",
        "impact": 2,
        "description": "NS (Name Server) records are missing, which can cause DNS resolution failures and indicates subdomains may not have proper authoritative delegation.",
        "remediation": "Review DNS zone configuration and ensure each subdomain has valid NS records pointing to authoritative servers.",
        "cvss": "6.8"
    },
    "Missing TXT record": {
        "threat_level": "High",
        "breach_risk": "High",
        "impact": 1,
        "description": "TXT records are absent, meaning no SPF or DMARC policies are in place. This leaves the domain open to email spoofing and phishing attacks.",
        "remediation": "Publish SPF TXT record: v=spf1 include:... -all. Add DMARC policy at _dmarc: v=DMARC1; p=quarantine.",
        "cvss": "7.1"
    },
    "Missing MX record": {
        "threat_level": "Medium",
        "breach_risk": "Medium",
        "impact": 1,
        "description": "MX records are absent. While mail delivery may not be intended, missing MX records can indicate incomplete DNS configuration.",
        "remediation": "If mail is not intended for these subdomains, publish a null MX record to explicitly indicate this and prevent abuse.",
        "cvss": "5.0"
    },
    "Risky port exposed": {
        "threat_level": "High",
        "breach_risk": "High",
        "impact": 10,
        "description": "A risky port (e.g., 8080, 3306, 21) is open and publicly accessible. These ports are frequently targeted by scanners and automated attack tools.",
        "remediation": "Close the risky port on all affected hosts or restrict access via firewall rules to trusted IPs only.",
        "cvss": "7.5"
    },
    "Unexpected open port": {
        "threat_level": "Medium",
        "breach_risk": "Medium",
        "impact": 8,
        "description": "An unexpected port is open. Ports not explicitly needed increase the attack surface and may indicate running services that should be firewalled.",
        "remediation": "Audit the open port and close it if the running service is not needed. Otherwise restrict access via firewall.",
        "cvss": "6.5"
    },
    "Malicious IP Activity Detected": {
        "threat_level": "High",
        "breach_risk": "High",
        "impact": 15,
        "description": "Infrastructure is associated with IPs known for malicious activity (spam, hacking, DDoS). We detected high-risk IP(s) in your configuration.",
        "remediation": "Contact your infrastructure provider to rotate IPs or investigate potential account compromise. Ensure all egress/ingress is restricted to legitimate traffic only.",
        "cvss": "8.2"
    },
    "Expired TLS": {
        "threat_level": "Critical",
        "breach_risk": "Critical",
        "impact": 20,
        "description": "The TLS certificate has expired, which means connections are no longer secure and browsers will display warnings to users.",
        "remediation": "Renew the TLS certificate immediately using your certificate authority or a service like Let's Encrypt.",
        "cvss": "9.8"
    },
    "Weak TLS version": {
        "threat_level": "High",
        "breach_risk": "High",
        "impact": 15,
        "description": "A weak or deprecated TLS version (like TLS 1.0 or 1.1) is enabled. These versions have known vulnerabilities and should be disabled.",
        "remediation": "Disable TLS 1.0 and 1.1 on your server and only allow TLS 1.2 or higher (preferably TLS 1.3).",
        "cvss": "7.5"
    }
}
