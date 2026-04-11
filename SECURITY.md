# 2. SECURITY.md

# Security Policy for Movyra

Security is a foundational pillar for Bongo and the Movyra, an initiative of AnyAstro Techno Pvt Ltd. We maintain rigorous standards to protect user identity, location telemetry, and transaction data against unauthorized access and exploitation.

## Supported Versions
We actively maintain, patch, and provide security updates for the following release branches of Movyra:

| Version | Supported          | End of Life (EOL) |
| ------- | ------------------ | ----------------- |
| 1.0.x   | Yes                | December 2027     |
| 0.9.x   | No                 | March 2026        |
| < 0.9   | No                 | Unsupported       |

## Vulnerability Reporting Protocol
If you discover a security vulnerability within the Movyra ecosystem, please DO NOT open a public GitHub issue or disclose the flaw publicly. Instead, adhere to the following coordinated disclosure process:

1.  **Contact the Security Team:** Send a detailed email to `security.mv@tuta.io` outlining the vulnerability.
2.  **Provide Technical Context:** Include precise steps to reproduce the issue, the affected version/component, the potential impact, and any proof-of-concept (PoC) code or scripts.
3.  **PGP Encryption:** If your report contains highly sensitive exploit payloads or customer data snippets, you must encrypt your communication using our public PGP key, available at `https://go.ly/aatpgp`.

## Incident Response and Remediation Timeline
Our security engineering team follows a strict SLA for addressing reported vulnerabilities:
* **Acknowledgment:** You will receive a response acknowledging receipt of your report within 24 hours.
* **Triage and Assessment:** The vulnerability will be assessed to determine its CVSS severity score within 72 hours.
* **Resolution:** Critical vulnerabilities (e.g., Authentication bypass, Firestore injection, unauthorized telemetry access) will be patched, and a hotfix will be deployed to production within 48 hours of verification.

## Bug Bounty Program
AnyAstro Techno Pvt Ltd operates a private bug bounty program for Movyra. Meaningful security reports that lead to validated code changes may be eligible for a financial reward. Rewards are evaluated on a case-by-case basis, factoring in the severity, impact, and quality of the report.