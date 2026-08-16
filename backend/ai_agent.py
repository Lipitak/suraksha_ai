import os
import json
from scanner import get_state, set_state

# Static bilingual dictionary mapping issue IDs to rich details and decisions
ISSUE_LIBRARY = {
    "ssl_invalid": {
        "title": "SSL Certificate Invalid or Missing",
        "title_hi": "SSL सर्टिफिकेट अमान्य या गायब है",
        "explanation_en": "Your website lacks a valid SSL/TLS certificate. Browsers will display 'Not Secure' warnings, and all network traffic (including passwords) is transmitted in cleartext, exposing it to interception.",
        "explanation_hi": "आपकी वेबसाइट पर एक वैध SSL/TLS सर्टिफिकेट नहीं है। ब्राउज़र 'Not Secure' की चेतावनी दिखाएंगे और यूजर पासवर्ड जैसी जानकारी हैकर्स द्वारा आसानी से चोरी की जा सकती है।",
        "fix_en": "Install a trusted SSL certificate (e.g. from Let's Encrypt for free) via your web host and enforce HTTPS redirection in your site configuration.",
        "fix_hi": "अपने वेब होस्ट के माध्यम से एक भरोसेमंद SSL सर्टिफिकेट इंस्टॉल करें (जैसे Let's Encrypt से मुफ़्त में) और अपनी साइट में HTTPS रीडायरेक्शन लागू करें।",
        "default_action": "AUTO_BLOCK",
        "reason_en": "AI has flagged this as Critical. Because users visiting your site are immediately exposed to eavesdropping, the AI simulates blocking external access (Auto-Block) to protect user credentials until a valid certificate is installed.",
        "reason_hi": "AI ने इसे अत्यंत गंभीर (Critical) घोषित किया है। क्योंकि आपकी साइट पर आने वाले यूजर्स का डेटा तुरंत चोरी होने का खतरा है, AI सुरक्षा के लिए बाहरी एक्सेस को ब्लॉक करने का अनुकरण (Auto-Block) करता है जब तक कि सर्टिफिकेट इंस्टॉल न हो जाए।"
    },
    "ssl_expiring_soon": {
        "title": "SSL Certificate Expiring Soon",
        "title_hi": "SSL सर्टिफिकेट जल्द ही समाप्त होने वाला है",
        "explanation_en": "The website's SSL/TLS certificate is valid but will expire in less than 15 days. If it expires, visitors will face security blocks and connection warnings.",
        "explanation_hi": "वेबसाइट का SSL/TLS सर्टिफिकेट अभी मान्य है लेकिन 15 दिनों से कम समय में एक्सपायर हो जाएगा। इसके समाप्त होने पर, विज़िटर्स को सुरक्षा चेतावनी और रुकावटों का सामना करना पड़ेगा।",
        "fix_en": "Access your server control panel or ACME agent settings and run the certificate renewal command immediately.",
        "fix_hi": "अपने सर्वर कंट्रोल पैनल या ACME एजेंट सेटिंग्स पर जाएं और सर्टिफिकेट रीन्यू करने का कमांड तुरंत चलाएं।",
        "default_action": "GUIDE",
        "reason_en": "The certificate is still currently valid, so no immediate blockage is needed. Since renewal requires server panel login or credentials, the AI provides step-by-step guidance rather than auto-fixing.",
        "reason_hi": "सर्टिफिकेट अभी भी काम कर रहा है, इसलिए तुरंत ब्लॉक करने की आवश्यकता नहीं है। चूंकि रीन्यू करने के लिए सर्वर लॉगिन की आवश्यकता होती है, इसलिए AI स्वचालित रूप से ठीक करने के बजाय चरण-दर-चरण मार्गदर्शन प्रदान करता है।"
    },
    "header_hsts_missing": {
        "title": "Strict-Transport-Security (HSTS) Missing",
        "title_hi": "Strict-Transport-Security (HSTS) हेडर गायब है",
        "explanation_en": "The HSTS header forces browsers to connect only over secure HTTPS. Without it, attackers can intercept initial HTTP traffic and downgrade users to unencrypted connections.",
        "explanation_hi": "HSTS हेडर ब्राउज़र को केवल सुरक्षित HTTPS के माध्यम से जुड़ने के लिए बाध्य करता है। इसके बिना, हैकर्स आपके कनेक्शन को हाईजैक करके उसे असुरक्षित HTTP में बदल सकते हैं।",
        "fix_en": "Add the header: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload' inside your web server configurations (Nginx/Apache).",
        "fix_hi": "अपने वेब सर्वर कॉन्फ़िगरेशन (Nginx/Apache) में 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload' हेडर जोड़ें।",
        "default_action": "AUTO_FIX",
        "reason_en": "Adding HSTS prevents downgrade attacks. This is a low-risk, highly standardized HTTP header, making it safe for the autonomous agent to inject automatically into web server headers.",
        "reason_hi": "HSTS जोड़ने से कनेक्शन सुरक्षित रहता है। यह एक कम जोखिम वाला और मानक सुरक्षा हेडर है, इसलिए AI इसे सर्वर कॉन्फ़िगरेशन में स्वचालित रूप से जोड़ने (Auto-Fix) का निर्णय लेता है।"
    },
    "header_csp_missing": {
        "title": "Content-Security-Policy (CSP) Missing",
        "title_hi": "Content-Security-Policy (CSP) हेडर गायब है",
        "explanation_en": "A Content-Security-Policy header defines which external scripts, styles, and assets can be loaded by browsers. Lacking it opens the site to Cross-Site Scripting (XSS) injections.",
        "explanation_hi": "CSP हेडर यह तय करता है कि आपकी साइट पर कौन से बाहरी कोड या स्क्रिप्ट्स लोड हो सकते हैं। इसके न होने से हैकर्स आपकी वेबसाइट में अपना वायरस कोड (XSS) आसानी से डाल सकते हैं।",
        "fix_en": "Formulate a default security CSP like: \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';\" and send it in response headers.",
        "fix_hi": "वेब सर्वर में एक डिफ़ॉल्ट CSP हेडर सेट करें जैसे: \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';\" ताकि केवल सुरक्षित स्रोत ही लोड हों।",
        "default_action": "AUTO_FIX",
        "reason_en": "Missing CSP is a critical entry point for malware injections. The agent applies a secure default script restriction layout automatically to shield the browser context.",
        "reason_hi": "CSP गायब होना मैलवेयर के लिए एक बड़ा रास्ता है। एजेंट ब्राउज़र संदर्भ की सुरक्षा के लिए स्वचालित रूप से एक सुरक्षित डिफ़ॉल्ट पॉलिसी कॉन्फ़िगर (Auto-Fix) करता है।"
    },
    "header_xframe_missing": {
        "title": "X-Frame-Options Missing (Clickjacking Vulnerability)",
        "title_hi": "X-Frame-Options हेडर गायब है (क्लिकजैकिंग का खतरा)",
        "explanation_en": "Without this header, other websites can embed your portal inside an invisible iframe. Users can be tricked into clicking hidden buttons (Clickjacking).",
        "explanation_hi": "इस हेडर के बिना, कोई भी बाहरी वेबसाइट आपके पेज को अपने अंदर एक अदृश्य फ्रेम में दिखा सकती है। इससे यूजर्स के साथ धोखाधड़ी (क्लिकजैकिंग) की जा सकती है।",
        "fix_en": "Enable the header 'X-Frame-Options: SAMEORIGIN' in your server settings to prevent unauthorized embedding.",
        "fix_hi": "अनधिकृत एम्बेडिंग को रोकने के लिए अपने वेब सर्वर की सेटिंग्स में 'X-Frame-Options: SAMEORIGIN' हेडर लागू करें।",
        "default_action": "AUTO_FIX",
        "reason_en": "Clickjacking protection is straightforward and has zero impact on core site rendering. The agent can inject the SAMEORIGIN restriction safely.",
        "reason_hi": "क्लिकजैकिंग सुरक्षा काफी सरल है और वेबसाइट के सामान्य कामकाज में कोई बाधा नहीं डालती। इसलिए एजेंट इसे तुरंत सुरक्षित तरीके से ऑटो-अप्लाई (Auto-Fix) करता है।"
    },
    "header_xcontent_missing": {
        "title": "X-Content-Type-Options Missing",
        "title_hi": "X-Content-Type-Options हेडर गायब है",
        "explanation_en": "This header stops web browsers from interpreting files as a different MIME type than declared (e.g. executing an uploaded image file as JavaScript).",
        "explanation_hi": "यह हेडर ब्राउज़र को फाइलों का मनमाना मतलब निकालने से रोकता है (जैसे किसी अपलोडेड इमेज फाइल को वायरस कोड की तरह रन करना)।",
        "fix_en": "Add 'X-Content-Type-Options: nosniff' header to all outgoing web server responses.",
        "fix_hi": "सभी रिस्पॉन्स में 'X-Content-Type-Options: nosniff' हेडर को वेब सर्वर कॉन्फ़िगरेशन में शामिल करें।",
        "default_action": "AUTO_FIX",
        "reason_en": "Nosniff configuration prevents browsers from executing uploaded user files as scripts. The agent executes this safety rule automatically with zero compatibility side effects.",
        "reason_hi": "Nosniff ब्राउज़र को हानिकारक फ़ाइलें चलाने से रोकता है। यह पूरी तरह से सुरक्षित सेटिंग है, इसलिए एजेंट इसे बिना किसी साइड इफ़ेक्ट के स्वचालित रूप से लागू (Auto-Fix) करता है।"
    },
    "server_version_disclosure": {
        "title": "Server Banner Information Leak",
        "title_hi": "सर्वर बैनर इंफॉर्मेशन लीक (वर्जन का खुलासा)",
        "explanation_en": "Your HTTP headers reveal the exact software and version running on the server (e.g. Apache/2.4.41). Attackers look for specific versions to run targeted exploit toolkits.",
        "explanation_hi": "आपका वेब हेडर सर्वर के सॉफ्टवेयर और उसके सटीक वर्जन को उजागर करता है (जैसे Apache/2.4.41)। हैकर्स इनका इस्तेमाल करके उस पुराने वर्जन के लिए बने वायरस टूल्स का उपयोग करते हैं।",
        "fix_en": "Turn off server signature settings in Nginx (server_tokens off) or Apache (ServerTokens Prod) to hide software detail.",
        "fix_hi": "सॉफ्टवेयर विवरण छिपाने के लिए Nginx (server_tokens off) या Apache (ServerTokens Prod) में सर्वर सिग्नेचर सेटिंग्स को बंद करें।",
        "default_action": "GUIDE",
        "reason_en": "Fixing version disclosure involves editing underlying configuration daemon files (nginx.conf or httpd.conf), which can crash the server if written wrong. The agent acts as a guide to assist manually.",
        "reason_hi": "वर्जन छिपाने के लिए मुख्य सर्वर फाइलों (nginx.conf या httpd.conf) में बदलाव करना पड़ता है, जिससे सर्वर क्रैश होने का जोखिम होता है। इसलिए AI इसे सुरक्षित रखने के लिए मार्गदर्शन (Guide) देता है।"
    }
}

def enrich_issues(scan_result):
    is_demo = scan_result["target"] == "demo-target"
    enriched_issues = []
    
    for issue in scan_result["issues"]:
        issue_id = issue["id"]
        meta = ISSUE_LIBRARY.get(issue_id, {})
        
        # Enriched details
        enriched = {
            "id": issue_id,
            "severity": issue["severity"],
            "title": meta.get("title", issue_id.replace("_", " ").title()),
            "title_hi": meta.get("title_hi", issue_id),
            "explanation_en": meta.get("explanation_en", ""),
            "explanation_hi": meta.get("explanation_hi", ""),
            "fix_en": meta.get("fix_en", ""),
            "fix_hi": meta.get("fix_hi", ""),
        }
        
        default_action = meta.get("default_action", "GUIDE")
        
        # Security boundaries: Only enable auto-fix for demo target
        if is_demo and default_action == "AUTO_FIX":
            action = "AUTO_FIX"
            auto_fixable = True
        else:
            # If scanning a real external website, degrade AUTO_FIX to GUIDE for safety
            action = "GUIDE" if default_action == "AUTO_FIX" else default_action
            auto_fixable = False
            
        reason_en = meta.get("reason_en", "")
        reason_hi = meta.get("reason_hi", "")
        
        # If downgraded, adjust reasons
        if not is_demo and default_action == "AUTO_FIX":
            reason_en = "This security fix is typically safe to auto-apply, but because this is a live external website, the AI provides step-by-step instructions to prevent server configuration corruption."
            reason_hi = "यह सुरक्षा पैच आमतौर पर ऑटो-अप्लाई के लिए सुरक्षित है, लेकिन चूंकि यह एक बाहरी लाइव वेबसाइट है, इसलिए सर्वर फ़ाइलों को सुरक्षित रखने के लिए AI आपको चरण-दर-चरण निर्देश प्रदान करता है।"
            
        enriched["auto_fixable"] = auto_fixable
        enriched["agent_decision"] = {
            "action": action,
            "reason_en": reason_en,
            "reason_hi": reason_hi
        }
        
        enriched_issues.append(enriched)
        
    scan_result["issues"] = enriched_issues
    return scan_result

def simulate_auto_fix(issue_id):
    # Retrieve current state
    state = get_state()
    
    # Check if we support auto-fix for this issue
    # The valid auto-fixable issue IDs are headers
    valid_fixes = ["header_hsts_missing", "header_csp_missing", "header_xframe_missing", "header_xcontent_missing"]
    
    if issue_id not in valid_fixes:
        return {
            "success": False,
            "message_en": "This issue cannot be automatically fixed on the target server.",
            "message_hi": "इस समस्या को लक्षित सर्वर पर स्वचालित रूप से ठीक नहीं किया जा सकता है।"
        }
        
    # Since we simulate the whole state, once one header is fixed, we can toggle the state
    # Wait, the user can click fix for specific headers one-by-one.
    # To support granular fixes, we can store in state which ones are fixed!
    # Let's expand state to track fixed headers.
    fixed_headers = state.get("fixed_headers", [])
    if issue_id not in fixed_headers:
        fixed_headers.append(issue_id)
        
    state["fixed_headers"] = fixed_headers
    
    # If all 4 headers are fixed, mark demo_target_fixed as True
    # In scanner.py we can check which headers are in fixed_headers!
    # Let's update state and return success.
    # Let's count headers. If HSTS, CSP, XFrame, and XContent are all in fixed_headers,
    # then demo_target_fixed becomes True.
    all_headers_fixed = len([h for h in valid_fixes if h in fixed_headers]) == 4
    state["demo_target_fixed"] = all_headers_fixed
    
    set_state(state)
    
    header_names = {
        "header_hsts_missing": "Strict-Transport-Security",
        "header_csp_missing": "Content-Security-Policy",
        "header_xframe_missing": "X-Frame-Options",
        "header_xcontent_missing": "X-Content-Type-Options"
    }
    
    name = header_names.get(issue_id, issue_id)
    
    return {
        "success": True,
        "message_en": f"Fix applied: Injected the '{name}' header into the server response configurations.",
        "message_hi": f"सुधार लागू: सर्वर रिस्पॉन्स कॉन्फ़िगरेशन में '{name}' हेडर इंजेक्ट कर दिया गया है।"
    }

def reset_demo_state():
    set_state({
        "demo_target_fixed": False,
        "fixed_headers": []
    })
    return {
        "success": True,
        "message_en": "Demo state reset successfully.",
        "message_hi": "डेमो स्थिति सफलतापूर्वक रीसेट हो गई है।"
    }
