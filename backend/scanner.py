import socket
import ssl
import datetime
import urllib.parse
import json
import os
import requests

STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "state.json")

def get_state():
    if not os.path.exists(STATE_FILE):
        set_state({"demo_target_fixed": False})
        return {"demo_target_fixed": False}
    try:
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    except:
        return {"demo_target_fixed": False}

def set_state(state):
    try:
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"Error setting state: {e}")

def check_ssl(hostname):
    # For demo-target, simulate valid SSL
    if hostname in ["demo-target", "localhost", "127.0.0.1"]:
        return {
            "valid": True,
            "reason": "Valid",
            "days_remaining": 245,
            "issuer": "SuRaksha Demo CA"
        }
        
    context = ssl.create_default_context()
    # Disable certificate validation errors block so we can inspect expired/invalid certs
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    
    try:
        with socket.create_connection((hostname, 443), timeout=4) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert(binary_form=True)
                # Re-connect to fetch certificate fields if needed
                # However, a simpler and more standard way to get parsed cert is using create_default_context and letting it connect
                pass
    except Exception as e:
        return {
            "valid": False,
            "reason": "Connection failed or port 443 closed",
            "days_remaining": 0,
            "issuer": None
        }

    # Now get parsed details using validation
    val_context = ssl.create_default_context()
    try:
        with socket.create_connection((hostname, 443), timeout=4) as sock:
            with val_context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                exp_date_str = cert.get('notAfter')
                issuer_dict = cert.get('issuer', ())
                issuer_cn = "Unknown"
                for rdn in issuer_dict:
                    for key, val in rdn:
                        if key == 'commonName':
                            issuer_cn = val
                
                if exp_date_str:
                    # Format: 'Aug 16 12:00:00 2026 GMT'
                    exp_date = datetime.datetime.strptime(exp_date_str, '%b %d %H:%M:%S %Y %Z')
                    days_remaining = (exp_date - datetime.datetime.utcnow()).days
                    if days_remaining <= 0:
                        return {
                            "valid": False,
                            "reason": "Expired",
                            "days_remaining": days_remaining,
                            "issuer": issuer_cn
                        }
                    return {
                        "valid": True,
                        "reason": "Valid",
                        "days_remaining": days_remaining,
                        "issuer": issuer_cn
                    }
                return {
                    "valid": True,
                    "reason": "Valid (No expiration info)",
                    "days_remaining": 365,
                    "issuer": issuer_cn
                }
    except ssl.SSLCertVerificationError as e:
        return {
            "valid": False,
            "reason": "Self-signed or Untrusted Certificate",
            "days_remaining": 0,
            "issuer": "Self-Signed/Untrusted"
        }
    except Exception as e:
        return {
            "valid": False,
            "reason": f"Verification error: {str(e)}",
            "days_remaining": 0,
            "issuer": None
        }

def scan_url(url_input):
    # Normalize input
    raw_input = url_input.strip()
    if not raw_input:
        raise ValueError("URL cannot be empty")
        
    raw_input_lower = raw_input.lower()
    is_insecure_demo = "demo-target-insecure" in raw_input_lower
    is_demo = "demo-target" in raw_input_lower or "localhost:5005/api/demo-target" in raw_input_lower or "localhost:5000/api/demo-target" in raw_input_lower
    
    if is_demo or is_insecure_demo:
        # Load state
        state = get_state()
        is_fixed = state.get("demo_target_fixed", False)
        fixed_headers = state.get("fixed_headers", [])
        
        target = "demo-target-insecure" if is_insecure_demo else "demo-target"
        scanned_at = datetime.datetime.utcnow().isoformat() + "Z"
        
        # Prepare issues
        issues = []
        score = 100
        
        # In insecure demo, SSL is missing (Critical: -35)
        if is_insecure_demo:
            issues.append({
                "id": "ssl_invalid",
                "severity": "Critical",
                "auto_fixable": False
            })
            score -= 35
            
        # Missing HSTS (High: -20)
        if "header_hsts_missing" not in fixed_headers and not is_fixed:
            issues.append({
                "id": "header_hsts_missing",
                "severity": "High",
                "auto_fixable": True
            })
            score -= 20
            
        # Missing CSP (High: -20)
        if "header_csp_missing" not in fixed_headers and not is_fixed:
            issues.append({
                "id": "header_csp_missing",
                "severity": "High",
                "auto_fixable": True
            })
            score -= 20
            
        # Missing X-Frame-Options (Medium: -15)
        if "header_xframe_missing" not in fixed_headers and not is_fixed:
            issues.append({
                "id": "header_xframe_missing",
                "severity": "Medium",
                "auto_fixable": True
            })
            score -= 15
            
        # Missing X-Content-Type-Options (Medium: -10)
        if "header_xcontent_missing" not in fixed_headers and not is_fixed:
            issues.append({
                "id": "header_xcontent_missing",
                "severity": "Medium",
                "auto_fixable": True
            })
            score -= 10
            
        # Server version exposure (Low: -5)
        # (This is not auto-fixable, so it remains until fixed by administrator)
        if not is_fixed:
            issues.append({
                "id": "server_version_disclosure",
                "severity": "Low",
                "auto_fixable": False
            })
            score -= 5
            
        return {
            "target": target,
            "scanned_at": scanned_at,
            "score": max(0, score),
            "total_issues": len(issues),
            "issues": issues,
            "ssl_info": {
                "valid": False if is_insecure_demo else True,
                "reason": "Missing or Expired Certificate" if is_insecure_demo else "Valid",
                "days_remaining": 0 if is_insecure_demo else 245,
                "issuer": None if is_insecure_demo else "SuRaksha Demo CA"
            }
        }

    # For live external websites
    # Standardize URL
    url = raw_input
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
        
    parsed = urllib.parse.urlparse(url)
    hostname = parsed.netloc or parsed.path.split('/')[0]
    
    # Clean port numbers if any
    hostname = hostname.split(':')[0]
    
    # Run SSL check
    ssl_result = check_ssl(hostname)
    
    # Make HTTP request to inspect headers
    issues = []
    score = 100
    
    # SSL Check Score Deduction
    if not ssl_result["valid"]:
        issues.append({
            "id": "ssl_invalid",
            "severity": "Critical",
            "auto_fixable": False
        })
        score -= 35
    elif ssl_result["days_remaining"] < 15:
        issues.append({
            "id": "ssl_expiring_soon",
            "severity": "High",
            "auto_fixable": False
        })
        score -= 20
        
    try:
        # Perform request with timeout
        # Using verify=False because we already checked SSL separately and want to get headers even if SSL is bad
        response = requests.get(url, timeout=5, verify=False, headers={"User-Agent": "SuRakshaAI-Scanner/1.0"})
        headers = response.headers
        
        # Check HSTS
        if not headers.get("Strict-Transport-Security"):
            issues.append({
                "id": "header_hsts_missing",
                "severity": "High",
                "auto_fixable": False  # Only auto-fixable on controlled demo-target
            })
            score -= 20
            
        # Check CSP
        if not headers.get("Content-Security-Policy"):
            issues.append({
                "id": "header_csp_missing",
                "severity": "High",
                "auto_fixable": False
            })
            score -= 20
            
        # Check X-Frame-Options
        if not headers.get("X-Frame-Options"):
            issues.append({
                "id": "header_xframe_missing",
                "severity": "Medium",
                "auto_fixable": False
            })
            score -= 15
            
        # Check X-Content-Type-Options
        if not headers.get("X-Content-Type-Options"):
            issues.append({
                "id": "header_xcontent_missing",
                "severity": "Medium",
                "auto_fixable": False
            })
            score -= 10
            
        # Check Server header version exposure
        server = headers.get("Server", "")
        # If Server header contains numbers (e.g. Apache/2.4.41), it leaks version
        if server and any(char.isdigit() for char in server):
            issues.append({
                "id": "server_version_disclosure",
                "severity": "Low",
                "auto_fixable": False
            })
            score -= 5
            
    except Exception as e:
        # If web request fails entirely, SSL might have been the blocker or host is down
        if ssl_result["valid"]:
            # If SSL is valid but we can't connect, maybe host is offline or blocking requests
            raise ConnectionError(f"Failed to connect to {url}: {str(e)}")
        else:
            # If SSL was already invalid, we list standard HTTP headers as missing too
            issues.extend([
                {"id": "header_hsts_missing", "severity": "High", "auto_fixable": False},
                {"id": "header_csp_missing", "severity": "High", "auto_fixable": False},
                {"id": "header_xframe_missing", "severity": "Medium", "auto_fixable": False},
                {"id": "header_xcontent_missing", "severity": "Medium", "auto_fixable": False}
            ])
            score -= 65

    # Sort issues by severity hierarchy
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    issues.sort(key=lambda x: severity_order.get(x["severity"], 4))
    
    return {
        "target": hostname,
        "scanned_at": datetime.datetime.utcnow().isoformat() + "Z",
        "score": max(0, score),
        "total_issues": len(issues),
        "issues": issues,
        "ssl_info": ssl_result
    }
