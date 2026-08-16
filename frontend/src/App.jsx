import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  BookOpen, 
  ArrowLeft, 
  Languages, 
  Terminal, 
  Settings, 
  UserX, 
  Server, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  Check
} from 'lucide-react';

const API_BASE = 'http://localhost:5005/api';

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Settings
  const [lang, setLang] = useState('en'); // 'en' or 'hi'
  const [activeTab, setActiveTab] = useState('vulnerabilities'); // 'vulnerabilities' or 'offboarding'
  const [expandedIssues, setExpandedIssues] = useState({});
  
  // Terminal and Auto-Fix simulation states
  const [fixingIssueId, setFixingIssueId] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [fixedSuccess, setFixedSuccess] = useState({});
  const [blockingIssueId, setBlockingIssueId] = useState(null);
  const [blockedSuccess, setBlockedSuccess] = useState({});

  // Employee offboarding mockup state
  const [offboardedEmployees, setOffboardedEmployees] = useState({});
  const [offboardingInProgress, setOffboardingInProgress] = useState(null);

  // Auto-focus input on mount
  useEffect(() => {
    const input = document.getElementById('domain-input');
    if (input) input.focus();
  }, [scanResult]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  // Basic domain name check to prevent crashing on invalid text input
  const validateDomain = (domain) => {
    const val = domain.trim().toLowerCase();
    if (!val) return false;
    if (val.includes('demo-target') || val.includes('localhost') || val.includes('127.0.0.1')) {
      return true;
    }
    // Match something like domain.com
    const pattern = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    // Strip HTTP/HTTPS protocol before verifying
    const host = val.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    return pattern.test(host);
  };

  const handleScan = async (e, urlToScan = null) => {
    if (e) e.preventDefault();
    const targetUrl = urlToScan || urlInput;
    
    if (!targetUrl.trim()) return;

    // Run input validation
    if (!validateDomain(targetUrl)) {
      setError(lang === 'en' 
        ? "We couldn't reach this website. Please check the URL and try again." 
        : "हम इस वेबसाइट तक नहीं पहुँच सके। कृपया यूआरएल जांचें और पुनः प्रयास करें।"
      );
      setScanResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);
    setExpandedIssues({});
    setTerminalLogs([]);
    setFixingIssueId(null);
    setBlockingIssueId(null);

    // Reset temporary session fixes if we scan a different target
    // But keep them if we scan the same one so it matches
    const isSameTarget = scanResult && (scanResult.target === targetUrl || (targetUrl === 'demo-target' && scanResult.target === 'demo-target'));
    if (!isSameTarget) {
      setFixedSuccess({});
      setBlockedSuccess({});
    }

    try {
      const response = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Scan failed');
      }
      
      const data = await response.json();
      setScanResult(data);
      setUrlInput(targetUrl);
    } catch (err) {
      console.error(err);
      setError(lang === 'en' 
        ? `Connection Error: Make sure the Flask server is running at ${API_BASE} and domain resolves correctly.` 
        : `कनेक्शन त्रुटि: सुनिश्चित करें कि फ्लास्क सर्वर ${API_BASE} पर चल रहा है और डोमेन सही है।`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      await fetch(`${API_BASE}/reset`, { method: 'POST' });
      setFixedSuccess({});
      setBlockedSuccess({});
      if (scanResult && (scanResult.target === 'demo-target' || scanResult.target === 'demo-target-insecure')) {
        handleScan(null, scanResult.target);
      }
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const runAutoFix = (issueId) => {
    setFixingIssueId(issueId);
    setTerminalLogs([]);
    
    const logs = [
      `[AGENT] Connecting to target server config daemon...`,
      `[AGENT] Analyzing HTTP response headers configurations...`,
      `[AGENT] Vulnerability located: ${issueId}`,
      `[AGENT] Enforcing secure policy block rules...`,
      `[AGENT] Injecting headers to HTTP server configuration file...`,
      `[AGENT] Restarting server routing instance...`,
      `[AGENT] Re-scanning target endpoint...`,
      `[AGENT] Security patch successfully deployed!`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        // Call backend API to apply fix state
        fetch(`${API_BASE}/auto-fix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issue_id: issueId })
        })
        .then(res => res.json())
        .then(data => {
          setFixedSuccess(prev => ({ ...prev, [issueId]: true }));
          setFixingIssueId(null);
        })
        .catch(err => {
          console.error(err);
          setFixingIssueId(null);
        });
      }
    }, 200);
  };

  const runAutoBlock = (issueId) => {
    setBlockingIssueId(issueId);
    setTerminalLogs([]);

    const logs = [
      `[AGENT] Critical Threat Shield Initializing...`,
      `[AGENT] Opening virtual traffic inspection node...`,
      `[AGENT] Analyzing network vulnerability risk factors...`,
      `[AGENT] Creating exposure isolation filters...`,
      `[AGENT] Deploying DNS traffic routing shield rules...`,
      `[AGENT] Intercepting public requests targeting ${issueId}...`,
      `[AGENT] External vulnerability exposure successfully BLOCKED!`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setBlockedSuccess(prev => ({ ...prev, [issueId]: true }));
        setBlockingIssueId(null);
      }
    }, 200);
  };

  const toggleExpandIssue = (id) => {
    setExpandedIssues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOffboard = (empId) => {
    setOffboardingInProgress(empId);
    
    // Simulate multi-platform revocation
    setTimeout(() => {
      setOffboardedEmployees(prev => ({ ...prev, [empId]: true }));
      setOffboardingInProgress(null);
    }, 1500);
  };

  // Recalculate score live based on fixed/blocked successes
  const getLiveScore = () => {
    if (!scanResult) return 100;
    let score = scanResult.score;
    
    // Check if we applied fixes/blocks in this session
    scanResult.issues.forEach(issue => {
      if (fixedSuccess[issue.id] || blockedSuccess[issue.id]) {
        if (issue.id === 'ssl_invalid') {
          score += 35;
        } else if (issue.id === 'header_hsts_missing') {
          score += 20;
        } else if (issue.id === 'header_csp_missing') {
          score += 20;
        } else if (issue.id === 'header_xframe_missing') {
          score += 15;
        } else if (issue.id === 'header_xcontent_missing') {
          score += 10;
        }
      }
    });
    return Math.min(100, score);
  };

  const getResolvedCount = () => {
    if (!scanResult) return 0;
    return scanResult.issues.filter(issue => fixedSuccess[issue.id] || blockedSuccess[issue.id]).length;
  };

  const liveScore = getLiveScore();
  const resolvedCount = getResolvedCount();

  // Translations
  const t = {
    en: {
      appName: "SuRaksha AI",
      teamTag: "Team: Bheem Ki Shakti | SIH 2026",
      subtitle: "Autonomous Cybersecurity Shield for SMBs",
      desc: "Enter your website URL to identify security gaps. Our autonomous agent auto-fixes server configs, blocks exposure on critical issues, and guides you in plain English & Hindi.",
      placeholder: "Enter domain (e.g., example.com or demo-target)...",
      scanBtn: "Scan Now",
      scanning: "Scanning Site Security...",
      quickDemo: "Try scanning sandbox targets:",
      resetDemo: "Reset Demo Environment",
      backBtn: "Start New Scan",
      scoreTitle: "Security Rating",
      metricsTarget: "Target Domain",
      metricsSsl: "SSL Certificate",
      metricsIssues: "Vulnerabilities Found",
      metricsFixed: "Issues Fixed",
      tabVulnerabilities: "Vulnerabilities & AI Actions",
      tabOffboarding: "1-Click Staff Offboarding (Demo)",
      severityCritical: "Critical",
      severityHigh: "High",
      severityMedium: "Medium",
      severityLow: "Low",
      actionAutoFix: "AUTO_FIX",
      actionGuide: "MANUAL_GUIDE",
      actionAutoBlock: "AUTO_BLOCK",
      aiReasoning: "AI Agent Reasoning & Decision",
      remediationSteps: "Manual Fix Steps",
      fixBtn: "Fix Automatically",
      blockBtn: "Block Exposure",
      fixSuccess: "Patched successfully — header added to server configuration.",
      blockSuccess: "Exposure restricted successfully — traffic shielded via agent firewall.",
      fixing: "Fixing...",
      blocking: "Shielding...",
      noIssues: "Perfect Score! No security weaknesses detected.",
      offboardTitle: "Employee Offboarding Console",
      offboardSubtitle: "Revoke all corporate credentials and network access in 1-click (Pitch Deck Prototype)",
      empName: "Employee",
      empRole: "Role",
      empGg: "Google Workspace",
      empAws: "AWS Cloud",
      empGh: "GitHub",
      empActions: "Actions",
      offboardBtn: "Revoke All Credentials",
      offboarding: "Revoking access...",
      offboarded: "Access Revoked",
      active: "Active",
      unfixedHeader: "Security Assessment",
      sslIssuer: "Issuer",
      sslDays: "Days left",
      secInfo: "Secure",
      vulnInfo: "Vulnerable",
      agentShell: "Agent Execution Console",
      sandboxBanner: "✅ This is your verified sandbox environment — Auto-Fix is enabled here.",
      externalBanner: "🔒 This is an external site — showing safe guidance only. In production, verifying domain ownership (via DNS record or file upload) would unlock Auto-Fix for this domain."
    },
    hi: {
      appName: "सुरक्षा AI",
      teamTag: "टीम: भीम की शक्ति | SIH 2026",
      subtitle: "SMBs के लिए स्वायत्त साइबर सुरक्षा कवच",
      desc: "सुरक्षा खामियों को पहचानने के लिए वेबसाइट URL दर्ज करें। हमारा स्वायत्त एजेंट सर्वर कॉन्फ़िगरेशन को ऑटो-फिक्स करता है, गंभीर खतरों को ब्लॉक करता है, और सरल हिंदी व अंग्रेजी में आपका मार्गदर्शन करता है।",
      placeholder: "डोमेन दर्ज करें (जैसे, example.com या demo-target)...",
      scanBtn: "स्कैन करें",
      scanning: "वेबसाइट सुरक्षा स्कैन हो रही है...",
      quickDemo: "सैंडबॉक्स लक्ष्यों को स्कैन करके देखें:",
      resetDemo: "डेमो एनवायरनमेंट रीसेट करें",
      backBtn: "नया स्कैन करें",
      scoreTitle: "सुरक्षा रेटिंग",
      metricsTarget: "लक्षित डोमेन",
      metricsSsl: "SSL सर्टिफिकेट",
      metricsIssues: "खामियां पाई गईं",
      metricsFixed: "सुधारे गए मुद्दे",
      tabVulnerabilities: "कमजोरियां और एआई एक्शन",
      tabOffboarding: "1-क्लिक स्टाफ ऑफबोर्डिंग (डेमो)",
      severityCritical: "अति गंभीर (Critical)",
      severityHigh: "गंभीर (High)",
      severityMedium: "मध्यम (Medium)",
      severityLow: "निम्न (Low)",
      actionAutoFix: "स्वचालित सुधार (AUTO_FIX)",
      actionGuide: "मैन्युअल गाइड (GUIDE)",
      actionAutoBlock: "स्वचालित ब्लॉक (AUTO_BLOCK)",
      aiReasoning: "AI एजेंट का निर्णय और तर्क",
      remediationSteps: "सुधारने के मैन्युअल चरण",
      fixBtn: "स्वचालित ठीक करें",
      blockBtn: "खतरे को ब्लॉक करें",
      fixSuccess: "सफलतापूर्वक ठीक हो गया — सर्वर कॉन्फ़िगरेशन में सुरक्षा हेडर जोड़ दिया गया है।",
      blockSuccess: "एक्सेस सफलतापूर्वक प्रतिबंधित कर दिया गया — ट्रैफ़िक को शील्ड के माध्यम से सुरक्षित किया गया है।",
      fixing: "ठीक हो रहा है...",
      blocking: "शील्ड हो रहा है...",
      noIssues: "उत्कृष्ट स्कोर! कोई सुरक्षा खामी नहीं मिली।",
      offboardTitle: "कर्मचारी ऑफबोर्डिंग कंसोल",
      offboardSubtitle: "1-क्लिक में सभी क्रेडेंशियल और नेटवर्क एक्सेस रद्द करें (पिच डेक प्रोटोटाइप)",
      empName: "कर्मचारी",
      empRole: "भूमिका",
      empGg: "गूगल वर्कस्पेस",
      empAws: "AWS क्लाउड",
      empGh: "गिटहब",
      empActions: "कार्रवाई",
      offboardBtn: "सभी क्रेडेंशियल रद्द करें",
      offboarding: "पहुंच रद्द हो रही है...",
      offboarded: "पहुंच रद्द कर दी गई",
      active: "सक्रिय (Active)",
      unfixedHeader: "सुरक्षा मूल्यांकन",
      sslIssuer: "जारीकर्ता",
      sslDays: "शेष दिन",
      secInfo: "सुरक्षित",
      vulnInfo: "असुरक्षित",
      agentShell: "एजेंट निष्पादन कंसोल",
      sandboxBanner: "✅ यह आपका सत्यापित सैंडबॉक्स वातावरण है — यहाँ ऑटो-फिक्स सक्षम है।",
      externalBanner: "🔒 यह एक बाहरी साइट है — केवल सुरक्षित मार्गदर्शन दिखाया जा रहा है। प्रोडक्शन में, डोमेन स्वामित्व की पुष्टि (DNS रिकॉर्ड या फ़ाइल अपलोड द्वारा) करने से इस डोमेन के लिए ऑटो-फिक्स अनलॉक हो जाएगा।"
    }
  }[lang];

  // Helper colors for Score Circle
  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--severity-secure)';
    if (score >= 60) return 'var(--severity-medium)';
    return 'var(--severity-critical)';
  };

  const getSeverityBadgeStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return {
          background: 'var(--severity-critical-bg)',
          color: 'var(--severity-critical)',
          border: '1px solid var(--severity-critical-border)'
        };
      case 'High':
        return {
          background: 'var(--severity-high-bg)',
          color: 'var(--severity-high)',
          border: '1px solid var(--severity-high-border)'
        };
      case 'Medium':
        return {
          background: 'var(--severity-medium-bg)',
          color: 'var(--severity-medium)',
          border: '1px solid var(--severity-medium-border)'
        };
      default:
        return {
          background: 'var(--severity-low-bg)',
          color: 'var(--severity-low)',
          border: '1px solid var(--severity-low-border)'
        };
    }
  };

  const getActionBadgeStyle = (action, isFixed, isBlocked) => {
    if (isFixed) {
      return {
        background: 'var(--severity-secure-bg)',
        color: 'var(--severity-secure)',
        border: '1px solid var(--severity-secure-border)'
      };
    }
    if (isBlocked) {
      return {
        background: 'var(--severity-block-bg)',
        color: '#f87171',
        border: '1px solid var(--severity-block-border)'
      };
    }
    if (action === 'AUTO_FIX') {
      return {
        background: 'var(--color-primary-glow)',
        color: '#a5b4fc',
        border: '1px solid rgba(99, 102, 241, 0.4)'
      };
    }
    if (action === 'AUTO_BLOCK') {
      return {
        background: 'var(--severity-block-bg)',
        color: '#fca5a5',
        border: '1px solid var(--severity-block-border)',
        boxShadow: '0 0 8px rgba(220, 38, 38, 0.3)',
        animation: 'pulseBorder 2s infinite'
      };
    }
    return {
      background: 'var(--severity-medium-bg)',
      color: '#fde047',
      border: '1px solid rgba(234, 179, 8, 0.4)'
    };
  };

  const isSandbox = (target) => {
    return target && (target.includes('demo-target') || target.includes('localhost') || target.includes('127.0.0.1'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global CSS Inject */}
      <style>{`
        .header-bar {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-badge {
          background: var(--color-primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a5b4fc;
          font-size: 0.7rem;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .lang-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--color-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
        }
        
        /* Hero section styling */
        .hero-section {
          text-align: center;
          padding: 5rem 0 3rem 0;
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
          line-height: 1.6;
          margin-bottom: 3rem;
        }
        
        /* Search Box styling */
        .search-container {
          position: relative;
          max-width: 650px;
          margin: 0 auto 2rem auto;
          display: flex;
          gap: 0.75rem;
          padding: 6px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: var(--transition-smooth);
        }
        .search-container:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 20px 0 rgba(99, 102, 241, 0.25);
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          padding: 0.75rem 1rem;
        }
        .search-btn {
          background: var(--color-primary);
          color: #ffffff;
          font-weight: 600;
          padding: 0 1.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }
        .search-btn:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }
        .search-btn:active {
          transform: translateY(0);
        }

        /* Demo badge triggers */
        .demo-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .demo-badge {
          background: rgba(99, 102, 241, 0.08);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 0.35rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: var(--transition-smooth);
        }
        .demo-badge:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--color-primary);
          color: #ffffff;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.15);
        }
        .reset-link {
          color: var(--text-muted);
          text-decoration: underline;
          cursor: pointer;
          margin-left: 1rem;
          font-size: 0.85rem;
        }
        .reset-link:hover {
          color: var(--severity-critical);
        }

        /* Dashboard specific styles */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        
        /* Metric cards */
        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .metric-card {
          padding: 1.25rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
        }
        .metric-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .metric-val {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Score Widget */
        .score-panel {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          height: fit-content;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .score-svg-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 1.5rem;
        }
        .score-text-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .score-num {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1;
          font-family: var(--font-heading);
        }
        .score-label-pct {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        /* Tabs styling */
        .tabs-header {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .tab-btn {
          background: transparent;
          color: var(--text-muted);
          padding: 0.75rem 0.25rem;
          font-weight: 600;
          font-size: 0.95rem;
          position: relative;
        }
        .tab-btn.active {
          color: var(--text-primary);
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-primary);
        }

        /* Issue cards list */
        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .issue-card {
          padding: 1.25rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .issue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .issue-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        .issue-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .issue-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        /* Badges */
        .badge-common {
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: var(--transition-smooth);
        }

        /* Issue Expanded View */
        .issue-expanded-content {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .issue-desc {
          color: var(--text-secondary);
          font-size: 0.925rem;
          line-height: 1.6;
        }
        .ai-reasoning-card {
          background: rgba(99, 102, 241, 0.04);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 8px;
          padding: 1rem;
        }
        .ai-reasoning-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #818cf8;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.5rem;
        }
        .ai-reasoning-text {
          font-size: 0.9rem;
          color: #c7d2fe;
          line-height: 1.5;
        }

        /* Code snippets */
        .code-container {
          background: #090d16;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.85rem;
          color: #38bdf8;
          overflow-x: auto;
        }

        /* Action Buttons */
        .action-btn-trigger {
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          align-self: flex-start;
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        }
        .btn-trigger-fix {
          background: var(--color-primary);
        }
        .btn-trigger-fix:hover {
          background: #4f46e5;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .btn-trigger-block {
          background: var(--severity-block);
        }
        .btn-trigger-block:hover {
          background: #dc2626;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
        }
        .btn-success-state {
          background: var(--severity-secure-bg);
          color: var(--severity-secure);
          border: 1px solid var(--severity-secure-border);
          padding: 0.5rem 1rem;
        }

        /* Agent Terminal logs */
        .terminal-box {
          background: #020617;
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          padding: 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          color: #38bdf8;
          margin-top: 0.5rem;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }
        .terminal-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 0.25rem;
        }
        .terminal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .terminal-line {
          animation: terminalLog 0.2s ease-out forwards;
          margin-bottom: 0.35rem;
        }
        .terminal-line:last-child {
          color: #4ade80;
          font-weight: 700;
        }

        /* Loading Spinner Widget */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 0;
          gap: 1.5rem;
        }
        .spinner-outer {
          position: relative;
          width: 70px;
          height: 70px;
        }
        .spinner {
          width: 70px;
          height: 70px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: var(--color-primary);
          border-radius: 50%;
        }

        /* Context Banners */
        .context-banner {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          line-height: 1.5;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .banner-sandbox {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #a7f3d0;
        }
        .banner-external {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #c7d2fe;
        }

        /* Offboarding Mockup Card styling */
        .offboarding-panel {
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .offboarding-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1.5rem;
          text-align: left;
        }
        .offboarding-table th, .offboarding-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .offboarding-table th {
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }
        .revoked-tag {
          color: var(--severity-critical);
          background: var(--severity-critical-bg);
          border: 1px solid var(--severity-critical-border);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .active-tag {
          color: var(--severity-secure);
          background: var(--severity-secure-bg);
          border: 1px solid var(--severity-secure-border);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}</style>

      {/* Header bar */}
      <header className="header-bar">
        <div className="container header-container">
          <div className="logo-section">
            <Shield className="animate-pulse" style={{ color: 'var(--color-primary)' }} size={28} />
            <div>
              <span className="logo-text">{t.appName}</span>
              <span className="logo-badge" style={{ marginLeft: '0.5rem' }}>BETA</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="hidden sm:inline">
              {t.teamTag}
            </span>
            <button className="lang-btn" onClick={toggleLanguage}>
              <Languages size={16} />
              <span>{lang === 'en' ? 'हिन्दी (HI)' : 'English (EN)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 0' }} className="container">
        {!scanResult ? (
          /* Landing Page Search Box */
          <div className="animate-fade-in">
            <div className="hero-section">
              <h1 className="hero-title">{t.subtitle}</h1>
              <p className="hero-subtitle">{t.desc}</p>
              
              <form onSubmit={handleScan}>
                <div className="search-container">
                  <input 
                    id="domain-input"
                    className="search-input" 
                    type="text" 
                    placeholder={t.placeholder}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={loading}
                  />
                  <button type="submit" className="search-btn" disabled={loading}>
                    <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
                    <span>{loading ? t.scanning : t.scanBtn}</span>
                  </button>
                </div>
              </form>

              {/* Sandbox quick buttons */}
              <div className="demo-bar">
                <span>{t.quickDemo}</span>
                <span className="demo-badge" onClick={() => handleScan(null, 'demo-target')}>
                  demo-target (Vulnerable Headers)
                </span>
                <span className="demo-badge" style={{ borderColor: 'rgba(239, 68, 68, 0.45)', color: '#fca5a5' }} onClick={() => handleScan(null, 'demo-target-insecure')}>
                  demo-target-insecure (Missing SSL)
                </span>
                <span className="reset-link" onClick={handleResetDemo}>
                  {t.resetDemo}
                </span>
              </div>
            </div>

            {loading && (
              /* Loading screen state */
              <div className="loading-container">
                <div className="spinner-outer">
                  <div className="spinner animate-spin"></div>
                  <Shield style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'var(--color-primary)'
                  }} size={24} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{t.scanning}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Testing SSL certificate configurations and response security headers...
                  </p>
                </div>
              </div>
            )}

            {error && (
              /* Error display */
              <div className="glass-panel" style={{
                maxWidth: '650px',
                margin: '2rem auto 0 auto',
                padding: '1.5rem',
                borderColor: 'var(--severity-critical-border)',
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <ShieldAlert style={{ color: 'var(--severity-critical)' }} size={32} />
                <div>
                  <h4 style={{ color: 'var(--severity-critical)', marginBottom: '0.25rem' }}>Scan Message</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Dashboard Results Page */
          <div className="animate-fade-in">
            {/* Context Authorization banner */}
            {isSandbox(scanResult.target) ? (
              <div className="context-banner banner-sandbox animate-fade-in">
                <ShieldCheck size={18} />
                <span>{t.sandboxBanner}</span>
              </div>
            ) : (
              <div className="context-banner banner-external animate-fade-in">
                <Lock size={18} />
                <span>{t.externalBanner}</span>
              </div>
            )}

            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <button className="lang-btn" onClick={() => setScanResult(null)}>
                <ArrowLeft size={16} />
                <span>{t.backBtn}</span>
              </button>
              
              {isSandbox(scanResult.target) && (
                <button className="lang-btn" style={{ borderColor: 'var(--severity-critical-border)' }} onClick={handleResetDemo}>
                  <RefreshCw size={14} />
                  <span>{t.resetDemo}</span>
                </button>
              )}
            </div>

            {/* Metrics cards row */}
            <div className="metrics-row">
              <div className="glass-panel metric-card">
                <span className="metric-label">{t.metricsTarget}</span>
                <span className="metric-val" title={scanResult.target}>{scanResult.target}</span>
              </div>
              <div className="glass-panel metric-card">
                <span className="metric-label">{t.metricsSsl}</span>
                <span className="metric-val" style={{ 
                  color: (scanResult.ssl_info.valid || blockedSuccess['ssl_invalid']) ? 'var(--severity-secure)' : 'var(--severity-critical)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  { (scanResult.ssl_info.valid || blockedSuccess['ssl_invalid']) ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                  { (scanResult.ssl_info.valid || blockedSuccess['ssl_invalid']) ? t.secInfo : t.vulnInfo}
                </span>
              </div>
              <div className="glass-panel metric-card">
                <span className="metric-label">{t.metricsIssues}</span>
                <span className="metric-val" style={{ color: (scanResult.total_issues - resolvedCount) > 0 ? 'var(--severity-high)' : 'var(--severity-secure)' }}>
                  {scanResult.total_issues - resolvedCount}
                </span>
              </div>
              <div className="glass-panel metric-card">
                <span className="metric-label">{t.metricsFixed}</span>
                <span className="metric-val" style={{ color: 'var(--severity-secure)' }}>
                  {resolvedCount} / {scanResult.issues.filter(i => i.id !== 'server_version_disclosure').length}
                </span>
              </div>
            </div>

            {/* Main grid */}
            <div className="dashboard-grid">
              {/* Left Score Gauge Column */}
              <div className="glass-panel score-panel">
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>{t.scoreTitle}</h3>
                
                <div className="score-svg-container">
                  <svg width="180" height="180" viewBox="0 0 100 100">
                    {/* Circle Background */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="8"
                    />
                    {/* Score arc indicator */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke={getScoreColor(liveScore)}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - liveScore / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                    />
                  </svg>
                  
                  {/* Inside Circle */}
                  <div className="score-text-inner">
                    <span className="score-num" style={{ color: getScoreColor(liveScore) }}>{liveScore}</span>
                    <span className="score-label-pct">Rating</span>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    {liveScore >= 90 ? (lang === 'en' ? 'Excellent' : 'अति उत्तम') :
                     liveScore >= 60 ? (lang === 'en' ? 'Medium Risk' : 'मध्यम जोखिम') :
                     (lang === 'en' ? 'Critical Risk' : 'गंभीर जोखिम')}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {lang === 'en' 
                      ? 'Continuous security reinforcement advised.' 
                      : 'सतत सुरक्षा सुदृढ़ीकरण की सलाह दी जाती है।'}
                  </p>
                  
                  {/* Access Restricted Tag for Insecure target + Block success */}
                  {scanResult.target === 'demo-target-insecure' && !blockedSuccess['ssl_invalid'] && (
                    <div className="badge-common" style={{ background: 'var(--severity-critical-bg)', color: 'var(--severity-critical)', border: '1px solid var(--severity-critical-border)', marginTop: '1.25rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                      ⚠️ {lang === 'en' ? 'Exposed Traffic' : 'ट्रैफ़िक खुला है'}
                    </div>
                  )}
                  {blockedSuccess['ssl_invalid'] && (
                    <div className="badge-common" style={{ background: 'var(--severity-block-bg)', color: '#f87171', border: '1px solid var(--severity-block-border)', marginTop: '1.25rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem', animation: 'pulseBorder 2.5s infinite' }}>
                      🛑 {lang === 'en' ? 'Access Restricted' : 'एक्सेस प्रतिबंधित है'}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Content Tab Column */}
              <div>
                {/* Tabs */}
                <div className="tabs-header">
                  <button 
                    className={`tab-btn ${activeTab === 'vulnerabilities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vulnerabilities')}
                  >
                    {t.tabVulnerabilities}
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'offboarding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('offboarding')}
                  >
                    {t.tabOffboarding}
                  </button>
                </div>

                {/* Tab content 1: Vulnerability list */}
                {activeTab === 'vulnerabilities' && (
                  <div className="issues-list">
                    {scanResult.total_issues === 0 ? (
                      /* Zero issues fallback state */
                      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <CheckCircle2 style={{ color: 'var(--severity-secure)', margin: '0 auto 1rem auto' }} size={48} />
                        <h4 style={{ marginBottom: '0.5rem' }}>{t.noIssues}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          This host is secured against initial web server exposure vectors.
                        </p>
                      </div>
                    ) : (
                      scanResult.issues.map((issue) => {
                        const isExpanded = !!expandedIssues[issue.id];
                        const isFixed = !!fixedSuccess[issue.id];
                        const isBlocked = !!blockedSuccess[issue.id];
                        
                        return (
                          <div 
                            key={issue.id} 
                            className="glass-panel issue-card"
                            style={{
                              borderColor: isFixed || isBlocked ? 'var(--severity-secure-border)' : 'rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <div className="issue-header" onClick={() => toggleExpandIssue(issue.id)}>
                              <div className="issue-title-group">
                                {isFixed || isBlocked ? (
                                  <ShieldCheck style={{ color: 'var(--severity-secure)' }} size={20} />
                                ) : (
                                  <AlertTriangle style={{ 
                                    color: issue.severity === 'Critical' ? 'var(--severity-critical)' : 
                                           issue.severity === 'High' ? 'var(--severity-high)' : 
                                           'var(--severity-medium)' 
                                  }} size={20} />
                                )}
                                <div>
                                  <h4 style={{ 
                                    color: (isFixed || isBlocked) ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    fontWeight: 600
                                  }}>
                                    {lang === 'en' ? issue.title : issue.title_hi}
                                  </h4>
                                </div>
                              </div>
                              <div className="issue-badges">
                                {/* Severity Badge */}
                                {!isFixed && !isBlocked && (
                                  <span className="badge-common" style={getSeverityBadgeStyle(issue.severity)}>
                                    {lang === 'en' ? issue.severity : (
                                      issue.severity === 'Critical' ? 'अति गंभीर' :
                                      issue.severity === 'High' ? 'गंभीर' :
                                      issue.severity === 'Medium' ? 'मध्यम' : 'निम्न'
                                    )}
                                  </span>
                                )}

                                {/* Agent Action Type / Fixed Badge */}
                                <span className="badge-common" style={getActionBadgeStyle(issue.agent_decision.action, isFixed, isBlocked)}>
                                  {isFixed && (
                                    <>
                                      <Check size={12} />
                                      <span>{lang === 'en' ? 'FIXED' : 'ठीक हो गया'}</span>
                                    </>
                                  )}
                                  {isBlocked && (
                                    <>
                                      <ShieldCheck size={12} />
                                      <span>{lang === 'en' ? 'BLOCKED' : 'ब्लॉक हो गया'}</span>
                                    </>
                                  )}
                                  {!isFixed && !isBlocked && (
                                    <>
                                      {issue.agent_decision.action === 'AUTO_FIX' && <Wrench size={12} />}
                                      {issue.agent_decision.action === 'AUTO_BLOCK' && <ShieldAlert size={12} />}
                                      {issue.agent_decision.action === 'GUIDE' && <BookOpen size={12} />}
                                      {lang === 'en' ? issue.agent_decision.action : (
                                        issue.agent_decision.action === 'AUTO_FIX' ? 'ऑटो-फिक्स' :
                                        issue.agent_decision.action === 'AUTO_BLOCK' ? 'ऑटो-ब्लॉक' : 'मैन्युअल गाइड'
                                      )}
                                    </>
                                  )}
                                </span>
                                
                                {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                              </div>
                            </div>

                            {/* Expanded section */}
                            {isExpanded && (
                              <div className="issue-expanded-content">
                                <p className="issue-desc">
                                  {lang === 'en' ? issue.explanation_en : issue.explanation_hi}
                                </p>

                                {/* Fixed Confirmation Line */}
                                {isFixed && (
                                  <div className="badge-common btn-success-state animate-fade-in" style={{ width: '100%', borderRadius: '8px' }}>
                                    <CheckCircle2 size={16} />
                                    <span>{t.fixSuccess}</span>
                                  </div>
                                )}

                                {/* Blocked Confirmation Line */}
                                {isBlocked && (
                                  <div className="badge-common animate-fade-in" style={{ background: 'var(--severity-block-bg)', color: '#fca5a5', border: '1px solid var(--severity-block-border)', width: '100%', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                                    <ShieldCheck size={16} />
                                    <span>{t.blockSuccess}</span>
                                  </div>
                                )}

                                {/* AI Reasoning Block */}
                                <div className="ai-reasoning-card">
                                  <span className="ai-reasoning-title">
                                    <Cpu size={14} />
                                    {t.aiReasoning}
                                  </span>
                                  <p className="ai-reasoning-text">
                                    {lang === 'en' ? issue.agent_decision.reason_en : issue.agent_decision.reason_hi}
                                  </p>
                                </div>

                                {/* Manual Remediation steps */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                    {t.remediationSteps}
                                  </span>
                                  <div className="code-container">
                                    {lang === 'en' ? issue.fix_en : issue.fix_hi}
                                  </div>
                                </div>

                                {/* Agent Action triggers */}
                                <div style={{ marginTop: '0.5rem' }}>
                                  {issue.agent_decision.action === 'AUTO_FIX' && !isFixed && (
                                    <button 
                                      className="action-btn-trigger btn-trigger-fix"
                                      onClick={() => runAutoFix(issue.id)}
                                      disabled={fixingIssueId === issue.id}
                                    >
                                      {fixingIssueId === issue.id ? (
                                        <>
                                          <RefreshCw className="animate-spin" size={16} />
                                          <span>{t.fixing}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Wrench size={16} />
                                          <span>{t.fixBtn}</span>
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {issue.agent_decision.action === 'AUTO_BLOCK' && !isBlocked && (
                                    <button 
                                      className="action-btn-trigger btn-trigger-block"
                                      onClick={() => runAutoBlock(issue.id)}
                                      disabled={blockingIssueId === issue.id}
                                    >
                                      {blockingIssueId === issue.id ? (
                                        <>
                                          <RefreshCw className="animate-spin" size={16} />
                                          <span>{t.blocking}</span>
                                        </>
                                      ) : (
                                        <>
                                          <ShieldAlert size={16} />
                                          <span>{t.blockBtn}</span>
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* Terminal logging feedback */}
                                  {(fixingIssueId === issue.id || blockingIssueId === issue.id) && (
                                    <div className="terminal-box animate-fade-in">
                                      <div className="terminal-header">
                                        <div className="terminal-dot" style={{ background: '#ef4444' }}></div>
                                        <div className="terminal-dot" style={{ background: '#eab308' }}></div>
                                        <div className="terminal-dot" style={{ background: '#22c55e' }}></div>
                                        <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>{t.agentShell}</span>
                                      </div>
                                      {terminalLogs.map((log, index) => (
                                        <div key={index} className="terminal-line">
                                          {log}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab content 2: Future Scope employee offboarding */}
                {activeTab === 'offboarding' && (
                  <div className="glass-panel offboarding-panel animate-fade-in">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                      <UserX size={32} style={{ color: 'var(--color-primary)' }} />
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t.offboardTitle}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.offboardSubtitle}</p>
                      </div>
                    </div>

                    <table className="offboarding-table">
                      <thead>
                        <tr>
                          <th>{t.empName}</th>
                          <th>{t.empRole}</th>
                          <th>{t.empGg}</th>
                          <th>{t.empAws}</th>
                          <th>{t.empGh}</th>
                          <th>{t.empActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'emp_1', name: 'Avadhi Sharma', role: 'DevOps Engineer' },
                          { id: 'emp_2', name: 'Lipi Tak', role: 'Full Stack Developer' },
                          { id: 'emp_3', name: 'Shagun Gupta', role: 'Technical Content Editor' }
                        ].map(emp => {
                          const isRevoked = !!offboardedEmployees[emp.id];
                          const isWorking = offboardingInProgress === emp.id;
                          
                          return (
                            <tr key={emp.id}>
                              <td style={{ fontWeight: 600 }}>{emp.name}</td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{emp.role}</td>
                              <td>
                                <span className={isRevoked ? "revoked-tag" : "active-tag"}>
                                  {isRevoked ? "Revoked" : t.active}
                                </span>
                              </td>
                              <td>
                                <span className={isRevoked ? "revoked-tag" : "active-tag"}>
                                  {isRevoked ? "Revoked" : t.active}
                                </span>
                              </td>
                              <td>
                                <span className={isRevoked ? "revoked-tag" : "active-tag"}>
                                  {isRevoked ? "Revoked" : t.active}
                                </span>
                              </td>
                              <td>
                                {isRevoked ? (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    {t.offboarded}
                                  </span>
                                ) : (
                                  <button 
                                    className="lang-btn" 
                                    style={{ 
                                      padding: '0.35rem 0.75rem', 
                                      fontSize: '0.8rem',
                                      borderColor: 'rgba(239, 68, 68, 0.4)',
                                      color: '#f87171',
                                      background: 'rgba(239, 68, 68, 0.05)'
                                    }}
                                    disabled={isWorking}
                                    onClick={() => handleOffboard(emp.id)}
                                  >
                                    {isWorking ? t.offboarding : t.offboardBtn}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                      <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        <strong>Pitch Deck Demonstration Node:</strong> Active integrations will invoke corporate API hooks to remove tokens, revoke GitHub access, and shut down SSH keys instantly. Device checking client installers can also be pushed to restrict devices from network structures.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        marginTop: 'auto', 
        padding: '2rem 0', 
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.9)',
        textAlign: 'center',
        fontSize: '0.825rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container">
          <p>© 2026 SuRaksha AI. Developed for Smart India Hackathon 2026.</p>
          <p style={{ marginTop: '0.25rem' }}>Problem Statement S18 | Team Bheem Ki Shakti (Lipi, Avadhi, Shagun, Keertika)</p>
        </div>
      </footer>
    </div>
  );
}
