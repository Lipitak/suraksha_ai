import os
import sys
from flask import Flask, request, jsonify, make_response
from scanner import scan_url, get_state
from ai_agent import enrich_issues, simulate_auto_fix, reset_demo_state

app = Flask(__name__)

# Custom CORS handler to prevent external flask-cors package dependency issues
@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

@app.route("/api/scan", methods=["POST", "OPTIONS"])
def api_scan():
    if request.method == "OPTIONS":
        return make_response("", 200)
        
    data = request.json or {}
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL parameter 'url' is required"}), 400
        
    try:
        raw_result = scan_url(url)
        enriched_result = enrich_issues(raw_result)
        return jsonify(enriched_result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/auto-fix", methods=["POST", "OPTIONS"])
def api_auto_fix():
    if request.method == "OPTIONS":
        return make_response("", 200)
        
    data = request.json or {}
    issue_id = data.get("issue_id")
    if not issue_id:
        return jsonify({"error": "Parameter 'issue_id' is required"}), 400
        
    try:
        result = simulate_auto_fix(issue_id)
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/reset", methods=["POST", "OPTIONS"])
def api_reset():
    if request.method == "OPTIONS":
        return make_response("", 200)
    try:
        result = reset_demo_state()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/demo-target", methods=["GET"])
def demo_target():
    # Mimic a web server that changes its headers based on state
    state = get_state()
    is_fixed = state.get("demo_target_fixed", False)
    fixed_headers = state.get("fixed_headers", [])
    
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SMB Portal - Under Assessment</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background: #0f172a;
                color: #f8fafc;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: #1e293b;
                border: 1px solid #334155;
                padding: 2.5rem;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
                max-width: 500px;
                text-align: center;
            }
            h1 {
                color: #38bdf8;
                margin-top: 0;
            }
            p {
                color: #94a3b8;
                line-height: 1.6;
            }
            .badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 500;
                margin-top: 1rem;
            }
            .badge-vuln {
                background: rgba(239, 68, 68, 0.2);
                color: #f87171;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            .badge-secure {
                background: rgba(34, 197, 94, 0.2);
                color: #4ade80;
                border: 1px solid rgba(34, 197, 94, 0.3);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Demo Target Business Portal</h1>
            <p>This is a controlled sandbox environment representing a typical small business website without proper web server security hardening.</p>
            <p>Use the SuRaksha AI dashboard to scan this url and deploy the agent's automated security fixes.</p>
            {status_badge}
        </div>
    </body>
    </html>
    """
    
    if is_fixed:
        status_badge = '<span class="badge badge-secure">Status: HARDENED BY SURAKSHA AI</span>'
    elif len(fixed_headers) > 0:
        status_badge = f'<span class="badge badge-vuln">Status: PARTIALLY SECURED ({len(fixed_headers)}/4 fixes applied)</span>'
    else:
        status_badge = '<span class="badge badge-vuln">Status: VULNERABLE</span>'
        
    response = make_response(html.format(status_badge=status_badge))
    
    # Hide server version by default unless server version is disclosed (simulating headers)
    # Actually, we simulate server header version exposure in scanner.py
    
    # Inject security headers dynamically depending on state
    if "header_hsts_missing" in fixed_headers or is_fixed:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    if "header_csp_missing" in fixed_headers or is_fixed:
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    if "header_xframe_missing" in fixed_headers or is_fixed:
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
    if "header_xcontent_missing" in fixed_headers or is_fixed:
        response.headers["X-Content-Type-Options"] = "nosniff"
        
    response.headers["Server"] = "SuRakshaAI-DemoSecureServer" if (is_fixed or len(fixed_headers) > 0) else "Apache/2.4.41 (Ubuntu)"
    
    return response

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    app.run(host="0.0.0.0", port=port, debug=True)
