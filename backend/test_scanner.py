import sys
import os

# Add current path to import scanner
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scanner import scan_url
from ai_agent import enrich_issues, simulate_auto_fix, reset_demo_state

def run_tests():
    print("=== Testing Secure360 Scanner Core ===")
    
    # 1. Reset state
    print("Resetting state...")
    reset_demo_state()
    
    # 2. Initial scan of demo-target (expect vulnerabilities)
    print("Scanning 'demo-target' before fixes...")
    res = scan_url("demo-target")
    enriched = enrich_issues(res)
    print(f"Target: {enriched['target']}")
    print(f"Initial Score: {enriched['score']}/100")
    print(f"Total Issues Found: {enriched['total_issues']}")
    for issue in enriched["issues"]:
        print(f" - [{issue['severity']}] {issue['title']} (Action: {issue['agent_decision']['action']})")
        
    assert len(enriched["issues"]) == 5, "Should have 5 initial vulnerabilities on demo-target"
    assert enriched["score"] == 30, f"Expected initial score of 30, got {enriched['score']}"
    
    # 3. Simulate auto-fixing HSTS
    print("\nSimulating auto-fix for 'header_hsts_missing'...")
    fix_res = simulate_auto_fix("header_hsts_missing")
    print(f"Fix result message: {fix_res['message_en']}")
    
    # 4. Scan again (expect 4 vulnerabilities, score should go up)
    print("Scanning 'demo-target' after HSTS fix...")
    res = scan_url("demo-target")
    enriched = enrich_issues(res)
    print(f"Updated Score: {enriched['score']}/100")
    print(f"Remaining Issues: {enriched['total_issues']}")
    for issue in enriched["issues"]:
        print(f" - [{issue['severity']}] {issue['title']} (Action: {issue['agent_decision']['action']})")
        
    assert len(enriched["issues"]) == 4, "Should have 4 remaining vulnerabilities"
    assert enriched["score"] == 50, f"Expected updated score of 50, got {enriched['score']}"
    
    # 5. Apply the rest of the auto-fixes
    print("\nSimulating auto-fix for remaining fixable headers...")
    simulate_auto_fix("header_csp_missing")
    simulate_auto_fix("header_xframe_missing")
    simulate_auto_fix("header_xcontent_missing")
    
    # 6. Re-scan (expect 0 vulnerabilities because demo_target_fixed will become True and clear issues)
    print("Scanning 'demo-target' after all auto-fixes...")
    res = scan_url("demo-target")
    enriched = enrich_issues(res)
    print(f"Final Score: {enriched['score']}/100")
    print(f"Final Issues Count: {enriched['total_issues']}")
    
    assert enriched["score"] == 100, f"Expected perfect score 100, got {enriched['score']}"
    assert enriched["total_issues"] == 0, "Expected 0 remaining issues"
    
    print("\n=== ALL CORE TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
