# Secure360 🛡️
### Autonomous Cybersecurity Assessment Platform for SMBs

**Smart India Hackathon 2026 | Problem Statement S18**
**Team: Bheem Ki Shakti**

---

## 🎯 Problem Statement

> Develop an affordable cybersecurity assessment platform for small businesses that automatically identifies common security weaknesses across websites, devices, accounts and network configurations and provides prioritized, easy-to-follow remediation guidance.

---

## 💡 About Secure360

Small and medium businesses (SMBs) are among the most frequently targeted by cyberattacks, yet most lack the budget or technical expertise to defend themselves. Existing enterprise security tools are too expensive and too complex for non-technical business owners.

**Secure360** solves this by giving SMBs a free, automated way to scan their website, understand their security risks in plain language (English and Hindi), and — where safe — have issues fixed automatically by an autonomous AI agent, without needing to hire a security expert.

---

## ✨ Key Features

### 🔍 Automated Website Security Scan
- SSL/TLS certificate validation
- Security header analysis (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- Server information exposure checks

### 📊 Prioritized Security Score
- A 0–100 security rating calculated from detected issues
- Issues sorted by severity (Critical → High → Medium → Low) so owners know what to fix first

### 🤖 Autonomous AI Agent
Every detected issue is classified into one of three actions:
| Action | What it means |
|---|---|
| **AUTO_FIX** | Safe to fix automatically — the agent applies the fix directly (enabled for verified/owned environments) |
| **GUIDE** | Requires owner judgment — the agent provides clear, step-by-step instructions |
| **AUTO_BLOCK** | Critical risk that can't be safely auto-fixed — the agent restricts exposure immediately and alerts the owner |

### 🧠 Explainable AI
Every agent decision comes with a plain-language **reason** — the system never just says "fixed" or "blocked" without explaining why, building trust with non-technical users.

### 🌐 Bilingual Guidance
All explanations and remediation steps are available in **English and Hindi**, making the platform accessible to India's large base of non-technical small business owners.

### 👤 1-Click Employee Offboarding (Demo)
A simulated console showing how, when an employee leaves a company, their access across connected accounts (Google Workspace, AWS, GitHub) can be revoked in a single click — addressing a commonly overlooked SMB security gap.

---

## 🏗️ How It Works

```
1. User enters a website URL
        ↓
2. Scanning Engine checks SSL + security headers
        ↓
3. Issues are detected and ranked by severity
        ↓
4. AI Agent classifies each issue:
   AUTO_FIX  /  GUIDE  /  AUTO_BLOCK  (with reasoning)
        ↓
5. Security Score (0-100) is calculated
        ↓
6. Dashboard shows prioritized issues + bilingual guidance
        ↓
7. User can trigger live Auto-Fix on eligible issues
```

> **Note on Auto-Fix behavior:** For real, external websites, the agent defaults to `GUIDE` rather than automatically making changes — since acting on infrastructure it doesn't own would be unsafe. `AUTO_FIX` is enabled for verified/owned environments (demonstrated here via a sandbox target). In a production version, this would be unlocked through a domain-ownership verification flow (e.g., a DNS TXT record or file-based check, similar to Google Search Console).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js (REST API) |
| Scanning | SSL/TLS validation, HTTP security header analysis |
| AI/Explainability | Rule-based severity classification with explainable reasoning |
| Language Support | English + Hindi (pre-written bilingual content) |

---

## 🚧 Current Scope

This prototype demonstrates the **website scanning pillar** of the platform end-to-end (scan → prioritize → act → explain). Device, account, and network configuration scanning (also required by the problem statement) follow the same architecture but require an installable local agent, and are part of the roadmap below.

---

## 🗺️ Future Scope

- Device security checks (antivirus, OS updates, firewall) via a lightweight installable agent
- Account security checks (breached credentials, weak passwords, 2FA status)
- Network/WiFi configuration checks
- Continuous/scheduled re-scanning with alerts
- Cloud account security (Google Workspace, AWS misconfigurations)
- DPDP Act (India) compliance mapping
- PDF report export
- Full domain-ownership verification flow to safely expand Auto-Fix to real, owned websites

---

## 📄 License

Built for Smart India Hackathon 2026 (Problem Statement S18) — for evaluation purposes.
