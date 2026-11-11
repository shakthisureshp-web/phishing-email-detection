import React, { useState } from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, ChevronRight, Lock, Eye, AlertOctagon, HelpCircle, Terminal } from 'lucide-react';

export const EducationalSection: React.FC = () => {
  const [activeTechnique, setActiveTechnique] = useState<number>(0);

  const techniques = [
    {
      title: 'Spear Phishing',
      target: 'Specific individuals, executives, or roles within an organization',
      description: 'Highly customized lures utilizing prior intelligence (OSINT, LinkedIn data, company organizational hierarchy) to establish credibility and lower victim vigilance.',
      example: '"Hi Elena, regarding the Express-Session dependency in repository acme/web-service you pushed yesterday, please authenticate to our new internal artifact registry to approve the merge."',
      redFlags: ['Subtle typos in internal domain names', 'Urgent bypass requests around normal PR review processes']
    },
    {
      title: 'Business Email Compromise (BEC / Whaling)',
      target: 'Finance department, payroll staff, or executive assistants',
      description: 'Impersonates the CEO, CFO, or a primary supplier to request unauthorized wire transfers, gift card purchases, or changes to vendor banking details.',
      example: '"I am currently in an executive board meeting and cannot take calls. Need an urgent wire transfer of $48,500 to our acquisition vendor before 3 PM today."',
      redFlags: ['Display name spoofing (e.g. CEO Name <ceo.office.direct@gmail.com>)', 'Demands for secrecy and bypassing accounting protocols']
    },
    {
      title: 'Credential Harvesting & Reverse Proxies',
      target: 'Enterprise users of Microsoft 365, Google Workspace, Okta, or AWS',
      description: 'Directs recipients to a counterfeit login portal that mimics single sign-on (SSO). Advanced setups (Evilginx) proxy session cookies in real-time to bypass standard SMS 2FA.',
      example: '"Your Office 365 password will expire today. Keep your current password by verifying access here: https://login.microsoftonline.portal-auth.cc."',
      redFlags: ['Lookalike domains with suspicious TLDs (.xyz, .cc, .top)', 'Urgent threats of immediate mailbox deletion']
    },
    {
      title: 'Clone Phishing',
      target: 'Recipients of legitimate routine corporate or transactional notices',
      description: 'Attackers capture an authentic, previously delivered email (e.g. shipping updates, airline confirmations, invoices), clone its visual template, and substitute malicious links or attachments.',
      example: '"FedEx Delivery Exception: Parcel #FX-98214 held at regional depot. Redelivery fee of $2.95 required."',
      redFlags: ['Link destinations that do not match the displayed anchor text or legitimate brand root domain']
    },
    {
      title: 'Quishing (QR Code Phishing)',
      target: 'Mobile phone users within corporate networks',
      description: 'Embeds malicious QR codes inside PDF attachments or email body graphics. Because traditional secure email gateways (SEGs) primarily scan textual links, image-encoded QR codes frequently slip past filters.',
      example: '"Scan this QR code with your mobile authenticator to complete your quarterly multi-factor authentication re-registration."',
      redFlags: ['Requests to scan QR codes for internal corporate access', 'Unusual PDF attachments with minimal body text']
    }
  ];

  const killChainSteps = [
    {
      step: '01',
      phase: 'Reconnaissance',
      detail: 'Attacker maps target organization, identifying vendor relationships, tech stack, and key personnel via LinkedIn, GitHub, and corporate press releases.'
    },
    {
      step: '02',
      phase: 'Weaponization & Infrastructure',
      detail: 'Adversary registers deceptive domain lookalikes (e.g., paypa1-update.xyz), acquires free SSL certificates, and clones genuine corporate login interfaces.'
    },
    {
      step: '03',
      phase: 'Delivery & Evasion',
      detail: 'Email is dispatched with spoofed display names, evasive obfuscation, and psychological coercion (urgency, fear of penalty, or executive authority).'
    },
    {
      step: '04',
      phase: 'Exploitation & Exfiltration',
      detail: 'Victim visits malicious host and enters credentials, multi-factor codes, or executes a malicious macro/payload.'
    },
    {
      step: '05',
      phase: 'Post-Exploitation & Persistence',
      detail: 'Attacker uses compromised credentials to establish mailbox forwarding rules, pivot laterally across the corporate network, or initiate fraudulent transactions.'
    }
  ];

  return (
    <div className="space-y-10">
      
      {/* Intro Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-emerald-400" />
          Phishing Threat Intelligence & Education
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Comprehensive guide on adversarial social engineering techniques, attack anatomy, and enterprise email security hardening.
        </p>
      </div>

      {/* What is Phishing? Card */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          What is Phishing?
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Phishing is a class of social engineering cyberattacks where threat actors masquerade as trusted entities (such as banks, cloud providers, corporate IT departments, or colleagues) through electronic communications. The primary objectives include manipulating victims into revealing sensitive authentication credentials, deploying ransomware or malware, or executing fraudulent wire transfers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Social Engineering</span>
            <p className="text-xs text-slate-400">
              Exploits psychological cognitive biases: fear, urgency, curiosity, or deference to authority rather than software vulnerabilities alone.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Initial Access Vector</span>
            <p className="text-xs text-slate-400">
              Responsible for over 85% of initial enterprise network compromises according to global cybersecurity incident reports.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Automated AI Detection</span>
            <p className="text-xs text-slate-400">
              Combines lexical TF-IDF feature analysis, sender reputation heuristics, and link inspection to flag anomalous patterns in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Technique Explorer */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Common Phishing Attack Vectors
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an attack methodology below to explore its mechanics, real-world examples, and signature indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Technique Tabs */}
          <div className="space-y-2">
            {techniques.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTechnique(idx)}
                className={`w-full text-left p-3.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                  activeTechnique === idx
                    ? 'bg-emerald-500/10 border-emerald-400/80 text-white font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{t.title}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${activeTechnique === idx ? 'text-emerald-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>

          {/* Active Technique Detail View */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">Attack Vector Analysis</span>
              <h4 className="text-xl font-bold text-white mt-1">
                {techniques[activeTechnique].title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Target Profile: {techniques[activeTechnique].target}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {techniques[activeTechnique].description}
            </p>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Typical Malicious Payload Example:</span>
              <div className="p-3.5 rounded-lg bg-[#080d1a] border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed italic">
                {techniques[activeTechnique].example}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-rose-400">Key Signature Red Flags:</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {techniques[activeTechnique].redFlags.map((flag, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <span className="text-rose-400">⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Anatomy of an Attack (Cyber Kill-Chain) */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Anatomy of an Attack: The Phishing Kill-Chain
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            How adversaries progress from target reconnaissance to credential exfiltration and unauthorized access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {killChainSteps.map((k) => (
            <div key={k.step} className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 block tabular-nums">
                {k.step}
              </span>
              <h4 className="text-xs font-bold text-white">
                {k.phase}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {k.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Best Practices Grid */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            Email Security Best Practices & Defensive Hardening
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Industry standards for technical configuration and user awareness defense-in-depth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              1. Enforce SPF, DKIM, and DMARC Policies
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Publish strict DMARC rejection records (`p=reject`) on your public DNS to prevent threat actors from directly spoofing your domain name in outbound phishing campaigns.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              2. FIDO2 / WebAuthn Hardware Security Keys
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transition away from SMS or time-based OTP codes to hardware-backed passkeys. FIDO2 binds authentication directly to the legitimate origin domain, cryptographically neutralizing reverse-proxy phish kits.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              3. Out-of-Band Financial Verification
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Establish a non-negotiable two-person rule for wire transfers or payroll changes: verify instructions over a known corporate phone number or in person before dispatching funds.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              4. Zero-Trust Link & Attachment Inspection
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inspect suspicious URLs in an isolated sandbox or ML scanner before visiting. Check root domains rather than trusting visual anchor text or brand logos.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
