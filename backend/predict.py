"""
PhishGuard - Python ML Prediction Helper for CLI and Server integration
Reads input JSON from stdin, transforms via TF-IDF Vectorizer and predicts using Logistic Regression.
"""

import sys
import json
import os
import re
import joblib

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BACKEND_DIR, "phishguard_model.pkl")
VECTORIZER_PATH = os.path.join(BACKEND_DIR, "phishguard_vectorizer.pkl")

SUSPICIOUS_TLDS = {".xyz", ".top", ".cc", ".tk", ".pw", ".club", ".work", ".click", ".info", ".online", ".site", ".biz"}

def extract_urls(text):
    url_pattern = re.compile(
        r'https?://(?:www\.)?([a-zA-Z0-9\.\-_]+)(?:/[^\s<>"\'\)]*)?',
        re.IGNORECASE
    )
    results = []
    for match in url_pattern.finditer(text):
        full_url = match.group(0)
        domain = match.group(1).lower()

        is_ip = bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain))
        has_suspicious_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
        has_hyphens = domain.count("-") >= 2
        subdomain_depth = len(domain.split(".")) > 3

        impersonation_keywords = ["paypal", "apple", "microsoft", "google", "chase", "netflix", "amazon", "docusign", "wells", "bank", "secure"]
        impersonates_brand = False
        for brand in impersonation_keywords:
            if brand in domain and not domain.endswith(f"{brand}.com") and not domain.endswith(f"{brand}.net"):
                impersonates_brand = True
                break

        risk_score = 0
        flags = []
        if is_ip:
            risk_score += 40
            flags.append("Raw IP address used instead of domain name")
        if has_suspicious_tld:
            risk_score += 25
            flags.append("Suspicious / low-reputation top-level domain (TLD)")
        if impersonates_brand:
            risk_score += 35
            flags.append("Brand typosquatting / spoofed target domain")
        if has_hyphens:
            risk_score += 15
            flags.append("Multiple hyphens indicating deceptive domain")
        if subdomain_depth:
            risk_score += 15
            flags.append("Excessive subdomain levels to conceal true host")

        threat_level = "High" if risk_score >= 35 else "Medium" if risk_score >= 15 else "Low"

        results.append({
            "url": full_url,
            "domain": domain,
            "is_ip": is_ip,
            "threat_level": threat_level,
            "risk_score": min(100, risk_score),
            "flags": flags
        })
    return results

SECURITY_PATTERNS = {
    "urgency": [
        "urgent", "immediately", "within 24 hours", "2 hours", "action required",
        "account suspended", "terminate", "final notice", "strictly confidential",
        "lock", "frozen", "deactivated"
    ],
    "credential_harvest": [
        "password", "ssn", "social security", "pin", "verify your credentials",
        "seed phrase", "credit card", "cvv", "login", "recover access", "re-authenticate",
        "one-time passcode", "2fa"
    ],
    "financial_lure": [
        "wire transfer", "gift card", "refund", "unclaimed", "payout", "dividend",
        "bonus", "bitcoin", "btc", "wallet", "invoice past due"
    ]
}

def analyze(subject, body, sender):
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)

    combined_text = f"{subject} {body} {sender}".lower()
    features = vectorizer.transform([f"{subject} {body} {sender}"])
    phish_prob = float(model.predict_proba(features)[0][1])

    url_details = extract_urls(f"{subject} {body}")
    has_high_risk_url = any(u["threat_level"] == "High" for u in url_details)

    detected_keywords = []
    urgency_cues = []
    credential_cues = []

    for word in SECURITY_PATTERNS["urgency"]:
        if word in combined_text:
            urgency_cues.append(word)
            detected_keywords.append({"term": word, "category": "Urgency & Coercion", "severity": "High"})

    for word in SECURITY_PATTERNS["credential_harvest"]:
        if word in combined_text:
            credential_cues.append(word)
            detected_keywords.append({"term": word, "category": "Credential Extraction", "severity": "Critical"})

    for word in SECURITY_PATTERNS["financial_lure"]:
        if word in combined_text:
            detected_keywords.append({"term": word, "category": "Financial Lure", "severity": "High"})

    sender_lower = sender.lower()
    sender_flags = []
    if any(sender_lower.endswith(tld) for tld in SUSPICIOUS_TLDS):
        sender_flags.append("Sender domain uses high-risk suspicious TLD")
    if any(b in sender_lower for b in ["paypal", "apple", "microsoft", "google", "chase", "bank"]) and any(f in sender_lower for f in ["@gmail.com", "@outlook.com", "@yahoo.com"]):
        sender_flags.append("Free email provider spoofing corporate institution")

    heuristic_penalty = 0.0
    if has_high_risk_url:
        heuristic_penalty += 0.20
    if len(credential_cues) >= 1:
        heuristic_penalty += 0.15
    if len(urgency_cues) >= 2:
        heuristic_penalty += 0.10
    if len(sender_flags) > 0:
        heuristic_penalty += 0.15

    composite_score = min(0.99, max(0.01, phish_prob * 0.70 + heuristic_penalty))

    if composite_score >= 0.65:
        classification = "PHISHING"
        risk_level = "CRITICAL" if composite_score >= 0.85 else "HIGH"
        confidence_pct = round(composite_score * 100, 1)
    elif composite_score >= 0.40:
        classification = "SUSPICIOUS"
        risk_level = "MEDIUM"
        confidence_pct = round(composite_score * 100, 1)
    else:
        classification = "SAFE"
        risk_level = "LOW"
        confidence_pct = round((1.0 - composite_score) * 100, 1)

    reasons = []
    if classification == "PHISHING":
        if credential_cues:
            reasons.append(f"Direct request for sensitive credentials detected ({', '.join(credential_cues[:3])}).")
        if url_details:
            reasons.append(f"Embedded links contain deceptive hosts ({', '.join([u['domain'] for u in url_details[:2]])}).")
        if urgency_cues:
            reasons.append(f"High urgency and fear-inducing deadline cues present ({', '.join(urgency_cues[:2])}).")
        if sender_flags:
            reasons.append("Sender address displays anomalous spoofing patterns.")
        if not reasons:
            reasons.append("Text structure and TF-IDF n-grams match recognized spear-phishing attack vectors.")
    elif classification == "SUSPICIOUS":
        reasons.append("Moderate risk signals detected: language urgency or unverified external links.")
        reasons.append("Exercise caution: independently verify sender through an out-of-band channel before clicking.")
    else:
        reasons.append("No credential harvesting patterns or deceptive redirection links found.")
        reasons.append("Language conforms to standard business correspondence characteristics.")
        reasons.append("TF-IDF classification weighted strongly towards legitimate corporate communications.")

    return {
        "classification": classification,
        "confidence_percentage": confidence_pct,
        "risk_level": risk_level,
        "raw_ml_probability": round(phish_prob, 4),
        "composite_score": round(composite_score, 4),
        "detected_keywords": detected_keywords,
        "urls_detected": url_details,
        "sender_analysis": {
            "sender": sender,
            "flags": sender_flags,
            "is_suspicious": len(sender_flags) > 0
        },
        "urgency_cues": urgency_cues,
        "reasons": reasons,
        "safety_disclaimer": "Predictions are probabilistic ML assessments based on TF-IDF feature weights and heuristics. Do not treat prediction confidence as a guarantee of safety."
    }

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input)
        sub = payload.get("subject", "")
        body = payload.get("body", "")
        sender = payload.get("sender", "")
        result = analyze(sub, body, sender)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
