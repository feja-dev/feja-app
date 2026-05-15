import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import logo from './Feja Logov1.png';
import supabase from './supabase';

const MOCK_USER = { id: null, email: 'test@feja.com', user_metadata: { name: 'Jaye', role: 'admin' } };

const SECTION_TYPES = {
  cold:      { label: 'Fridge / Cold Storage', threshold: { max: 5 },  correctiveActions: ['Moved to working fridge', 'Supervisor notified', 'Repair booked', 'Stock discarded'] },
  hot:       { label: 'Hot Holding',           threshold: { min: 60 }, correctiveActions: ['Reheated', 'Discarded', 'Supervisor notified'] },
  reheating: { label: 'Reheating',             threshold: { min: 75 }, correctiveActions: ['Reheated again', 'Discarded', 'Supervisor notified'] },
  delivery:  { label: 'Delivery',              threshold: { max: 5 },  correctiveActions: ['Delivery rejected', 'Supplier notified', 'Stock discarded'] },
  custom:    { label: 'Custom',                threshold: {},           correctiveActions: [] },
};

const LOG_SECTIONS = [
  { id: 'fridge',   title: 'Fridge Temps', type: 'cold',      threshold: { max: 5 },  correctiveActions: ['Moved to working fridge', 'Supervisor notified', 'Repair booked', 'Stock discarded'], items: ['Walk-in Fridge', 'Prep Fridge', 'Display Fridge'] },
  { id: 'reheating',title: 'Reheating',    type: 'reheating', threshold: { min: 75 }, correctiveActions: ['Reheated again', 'Discarded', 'Supervisor notified'], items: ['Soup', 'Rice', 'Sauce'] },
  { id: 'serving',  title: 'Hot Holding',  type: 'hot',       threshold: { min: 60 }, correctiveActions: ['Reheated', 'Discarded', 'Supervisor notified'], items: ['Soup', 'Chicken', 'Vegetables'] },
  { id: 'delivery', title: 'Delivery',     type: 'delivery',  threshold: { max: 5 },  correctiveActions: ['Delivery rejected', 'Supplier notified', 'Stock discarded'], items: ['Fresh Produce', 'Dairy', 'Meat'] },
];

function getResult(threshold, temp) {
  if (temp === '') return null;
  const t = parseFloat(temp);
  if (isNaN(t)) return null;
  if (threshold.max !== undefined && t > threshold.max) return 'fail';
  if (threshold.min !== undefined && t < threshold.min) return 'fail';
  return 'pass';
}

function LegalModal({ doc, onClose }) {
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-modal" onClick={e => e.stopPropagation()}>
        <div className="legal-modal-top">
          <div>
            <span className="legal-doc-label">Legal</span>
            <h2 className="legal-modal-title">
              {doc === 'privacy' ? 'Privacy Policy' : doc === 'terms' ? 'Terms & Conditions' : 'Refund Policy'}
            </h2>
          </div>
          <button className="legal-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="legal-modal-body">
          {doc === 'privacy' && <PrivacyContent />}
          {doc === 'terms' && <TermsContent />}
          {doc === 'refund' && <RefundContent />}
        </div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <>
      <p className="legal-meta">Last updated: May 2026 · Feja by Jaye · Victoria, Australia</p>
      <p>Feja ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share information when you use Feja. We comply with the <strong>Privacy Act 1988 (Cth)</strong> and the Australian Privacy Principles (APPs).</p>
      <h3>1. Information We Collect</h3>
      <ul>
        <li><strong>Account information:</strong> Name, email address, business name, and role.</li>
        <li><strong>Venue data:</strong> Kitchen or venue name, address, and operating details.</li>
        <li><strong>Compliance records:</strong> Temperature logs, shift checklists, and food safety records.</li>
        <li><strong>Billing information:</strong> Processed securely through Stripe. We do not store card details.</li>
        <li><strong>Usage data:</strong> Log files, device type, browser, IP address, and feature usage.</li>
      </ul>
      <h3>2. How We Use Your Information</h3>
      <ul>
        <li>To provide and operate the Feja platform.</li>
        <li>To store and display your food safety compliance records.</li>
        <li>To process subscription payments via Stripe.</li>
        <li>To send transactional emails (account verification, receipts).</li>
        <li>To improve the platform through anonymised usage analytics.</li>
      </ul>
      <h3>3. Data Storage and Security</h3>
      <p>Your data is stored in Supabase on secure cloud infrastructure. We use Row-Level Security (RLS) to ensure each venue can only access its own data. Data is encrypted in transit (TLS) and at rest.</p>
      <h3>4. Data Sharing</h3>
      <p>We do not sell your personal information. We share data only with trusted providers needed to operate Feja: <strong>Stripe</strong> (payments), <strong>Supabase</strong> (database and auth), and email providers (transactional comms).</p>
      <h3>5. Data Retention</h3>
      <p>We retain your data while your subscription is active and for up to 7 years after account closure to comply with FSANZ Standard 3.2.2A Australian food safety record-keeping requirements.</p>
      <h3>6. Your Rights</h3>
      <p>Under the Privacy Act 1988, you have the right to access, correct, or request deletion of your personal information, and to opt out of marketing communications at any time.</p>
      <h3>7. Changes to This Policy</h3>
      <p>We may update this policy from time to time and will notify you of material changes via email or in-app notice.</p>
      <h3>8. Contact</h3>
      <div className="legal-contact-box">
        <p><strong>Email:</strong> hello@feja.com.au</p>
        <p><strong>Location:</strong> Victoria, Australia</p>
      </div>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p className="legal-meta">Last updated: May 2026 · Feja by Jaye · Victoria, Australia</p>
      <p>These Terms and Conditions govern your access to and use of the Feja platform. By creating an account or using Feja, you agree to be bound by these Terms.</p>
      <div className="legal-highlight-box">
        <p><strong>Important:</strong> Feja is a record-keeping tool. It does not guarantee compliance with any food safety legislation. It is your responsibility to ensure your business meets all applicable legal requirements.</p>
      </div>
      <h3>1. About Feja</h3>
      <p>Feja is a food safety and kitchen compliance platform for commercial kitchens. Operated by Jaye, Victoria, Australia.</p>
      <h3>2. Eligibility</h3>
      <p>You must be at least 18 years old and have authority to bind your business to these Terms. Feja is intended for commercial food businesses operating in Australia.</p>
      <h3>3. Accounts and Access</h3>
      <p>You are responsible for maintaining the confidentiality of your login credentials and all activity under your account, including ensuring your staff comply with these Terms.</p>
      <h3>4. Subscription and Billing</h3>
      <ul>
        <li>$30 AUD per venue per month (plus GST where applicable).</li>
        <li>14-day free trial for new venues — no credit card required to start.</li>
        <li>Billing begins at the end of the trial. Cancel before then to avoid charges.</li>
        <li>Payments processed via Stripe. Subscriptions renew automatically each month.</li>
        <li>Cancel any time from account settings — takes effect at end of the current billing period.</li>
        <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
      </ul>
      <h3>5. Acceptable Use</h3>
      <p>You agree not to use Feja for any unlawful purpose, attempt to access other venues' data, reverse engineer any part of the service, misrepresent compliance records, or resell access to the platform.</p>
      <h3>6. Your Data</h3>
      <p>You own the compliance data you enter into Feja. We recommend regular exports for your own backup. Feja is not liable for data loss caused by factors outside our reasonable control.</p>
      <h3>7. Limitation of Liability</h3>
      <p>To the maximum extent permitted by Australian law, our total liability for any claim will not exceed the total amount you paid us in the 3 months preceding the claim.</p>
      <h3>8. Termination</h3>
      <p>We may suspend or terminate your account if you breach these Terms or fail to pay. Upon termination, data is retained for up to 7 years per FSANZ requirements then deleted.</p>
      <h3>9. Governing Law</h3>
      <p>These Terms are governed by the laws of Victoria, Australia.</p>
      <h3>10. Contact</h3>
      <div className="legal-contact-box">
        <p><strong>Email:</strong> hello@feja.com.au</p>
        <p><strong>Location:</strong> Victoria, Australia</p>
      </div>
    </>
  );
}

function RefundContent() {
  return (
    <>
      <p className="legal-meta">Last updated: May 2026 · Feja by Jaye · Victoria, Australia</p>
      <p>We want you to be satisfied with Feja. This policy explains when refunds are available and how to request one.</p>
      <div className="legal-summary-grid">
        <div className="legal-summary-card legal-card-green"><div className="legal-card-label">Free Trial</div><div className="legal-card-value">14 days, no charge</div></div>
        <div className="legal-summary-card legal-card-green"><div className="legal-card-label">Cancellation</div><div className="legal-card-value">Any time, no penalty</div></div>
        <div className="legal-summary-card legal-card-amber"><div className="legal-card-label">Refund Window</div><div className="legal-card-value">7 days from charge</div></div>
        <div className="legal-summary-card legal-card-amber"><div className="legal-card-label">Partial Refunds</div><div className="legal-card-value">Case by case</div></div>
      </div>
      <h3>1. Free Trial</h3>
      <p>All new venues receive a 14-day free trial. You will not be charged during this period. Cancel before it ends and no payment will be taken.</p>
      <h3>2. Cancellation</h3>
      <p>Cancel at any time from account settings. Takes effect at the end of your current billing period — no charge for the following period.</p>
      <h3>3. Refund Eligibility</h3>
      <ul>
        <li><strong>Within 7 days of your first paid charge:</strong> Contact us and we'll issue a full refund, no questions asked.</li>
        <li><strong>Billing errors:</strong> Incorrect charges (e.g. charged twice, charged after cancellation) will be refunded in full.</li>
        <li><strong>Extended outages:</strong> Verified outages over 48 consecutive hours may be eligible for a pro-rata credit or refund.</li>
      </ul>
      <h3>4. Non-Refundable Circumstances</h3>
      <ul>
        <li>Forgetting to cancel before the renewal date.</li>
        <li>Not using the platform during a billing period.</li>
        <li>Requests made more than 30 days after a charge.</li>
      </ul>
      <p>Circumstances vary — reach out and we'll consider unusual situations case by case.</p>
      <h3>5. Australian Consumer Law</h3>
      <p>Nothing in this policy limits your rights under the <strong>Australian Consumer Law (ACL)</strong>. For more information, visit accc.gov.au.</p>
      <h3>6. How to Request a Refund</h3>
      <p>Email us with your account email, venue name, date of charge, and reason. We aim to respond within 2 business days. Approved refunds are processed via Stripe and typically appear within 5–10 business days.</p>
      <h3>7. Contact</h3>
      <div className="legal-contact-box">
        <p><strong>Email:</strong> hello@feja.com.au</p>
        <p><strong>Location:</strong> Victoria, Australia</p>
      </div>
    </>
  );
}

function LandingPage({ onOpenApp, onDemoStaff, onDemoAdmin, onSignedUp, inviteVenueId }) {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null);
  const [showFormPassword, setShowFormPassword] = useState(false);

  useEffect(() => {
    if (inviteVenueId) setShowForm(true);
  }, [inviteVenueId]);

  const handleSignUp = async () => {
    if (!formName.trim() || (!inviteVenueId && !formVenue.trim()) || !formEmail.trim() || !formPassword.trim()) return;
    setFormLoading(true);
    setFormError('');
    const metadata = inviteVenueId
      ? { name: formName.trim(), invited_venue_id: inviteVenueId }
      : { name: formName.trim(), venue_name: formVenue.trim() };
    const { data, error } = await supabase.auth.signUp({
      email: formEmail.trim(),
      password: formPassword.trim(),
      options: { data: metadata },
    });
    if (error) { setFormError(error.message); setFormLoading(false); return; }
    if (!data?.user) { setFormLoading(false); return; }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: formEmail.trim(),
      password: formPassword.trim(),
    });
    if (signInError) { setFormError(signInError.message); setFormLoading(false); return; }

    const signedInUser = signInData.user;

    if (inviteVenueId) {
      await supabase.from('profiles').insert({
        id: signedInUser.id,
        name: formName.trim(),
        venue_id: inviteVenueId,
        role: 'staff',
      });
    } else {
      const { data: venueData } = await supabase
        .from('venues')
        .insert({ name: formVenue.trim() })
        .select()
        .single();
      if (venueData) {
        await supabase.from('profiles').insert({
          id: signedInUser.id,
          name: formName.trim(),
          venue_id: venueData.id,
          role: 'admin',
        });
      }
    }

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Feja Signups <onboarding@resend.dev>',
        to: 'jaye@greenpointmedia.com.au',
        subject: `New signup: ${formName.trim()} — ${formVenue.trim() || 'invited staff'}`,
        html: `<p><strong>Name:</strong> ${formName.trim()}</p><p><strong>Venue:</strong> ${formVenue.trim() || '(invited staff)'}</p><p><strong>Email:</strong> ${formEmail.trim()}</p>`,
      }),
    }).catch(() => {});

    setFormLoading(false);
    onSignedUp(signedInUser);
  };

  return (
    <div className="lp">

      <nav className="lp-nav">
        <div className="lp-nav-wordmark">fe<span>ja</span>.</div>
        <button className="lp-nav-signin" onClick={onOpenApp}>Sign in</button>
      </nav>

      <section className="lp-hero">
        <img src={logo} alt="Feja" className="lp-hero-logo" />
        <h1 className="lp-hero-headline">Kitchen compliance,<br />made simple.</h1>
        <p className="lp-hero-sub">Ditch the paper. Log temps, track corrective actions, and stay audit-ready. Right from your phone.</p>
        {!showForm && (
          <button className="lp-btn-primary" onClick={() => setShowForm(true)}>
            Start free trial
          </button>
        )}

        {showForm && (
          <div className="lp-lead-form">
            {inviteVenueId ? (
              <p className="lp-invite-heading">You've been invited to join a team on Feja. Create your account below.</p>
            ) : (
              <button className="login-back-btn" onClick={() => setShowForm(false)}>←</button>
            )}
            <input className="f-input" placeholder="Your name" value={formName} onChange={e => setFormName(e.target.value)} />
            {!inviteVenueId && <input className="f-input" placeholder="Venue name" value={formVenue} onChange={e => setFormVenue(e.target.value)} />}
            <input className="f-input" type="email" placeholder="Email address" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
            <div className="pw-wrap">
              <input className="f-input" type={showFormPassword ? 'text' : 'password'} placeholder="Choose a password" value={formPassword} onChange={e => setFormPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && agreed && handleSignUp()} />
              <button type="button" className="pw-toggle" aria-label={showFormPassword ? 'Hide password' : 'Show password'} onClick={() => setShowFormPassword(p => !p)}>
                {showFormPassword
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
            <label className="legal-checkbox-row">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <span>I agree to the <button type="button" className="legal-inline-link" onClick={() => setLegalDoc('terms')}>Terms & Conditions</button> and <button type="button" className="legal-inline-link" onClick={() => setLegalDoc('privacy')}>Privacy Policy</button></span>
            </label>
            {formError && <p className="auth-error">{formError}</p>}
            <button className="lp-btn-primary" onClick={handleSignUp} disabled={formLoading || !agreed}>
              {formLoading ? 'Setting up...' : 'Create account'}
            </button>
            <button className="lp-lead-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        )}

        <p className="lp-hero-trust">14-day free trial · No card required · $30/month after</p>
      </section>

      <section className="lp-features">
        <div className="lp-feature">
          <div className="lp-feature-title">Log in seconds</div>
          <div className="lp-feature-text">Temp checks, pass/fail results, and corrective actions. Done in a tap, from any device.</div>
        </div>
        <div className="lp-feature">
          <div className="lp-feature-title">Always audit-ready</div>
          <div className="lp-feature-text">Every entry is timestamped and stored. Pull reports the moment an inspector walks in.</div>
        </div>
        <div className="lp-feature">
          <div className="lp-feature-title">Built for your whole team</div>
          <div className="lp-feature-text">Unlimited staff. Admins get a full dashboard and settings control. One flat price per venue.</div>
        </div>
      </section>

      <section className="lp-pricing">
        <p className="lp-pricing-eyebrow">Pricing</p>
        <h2 className="lp-pricing-title">One plan. No surprises.</h2>
        <div className="lp-plan">
          <div className="lp-plan-price">
            <span className="lp-plan-amt">$30</span>
            <span className="lp-plan-per">/month per venue</span>
          </div>
          <p className="lp-plan-trial">14-day free trial · No card required</p>
          <ul className="lp-plan-list">
            <li>Unlimited staff</li>
            <li>All compliance sections</li>
            <li>Admin dashboard &amp; reports</li>
            <li>Australian food safety standards</li>
          </ul>
          <button className="lp-btn-primary" onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Start free trial
          </button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-wordmark">fe<span>ja</span>.</div>
        <p className="lp-footer-tag">Less paperwork, more cooking.</p>
        <div className="lp-demo-btns">
          <button className="lp-demo-btn" onClick={onDemoStaff}>Team</button>
          <button className="lp-demo-btn" onClick={onDemoAdmin}>Admin</button>
        </div>
        <div className="lp-footer-legal">
          <button className="lp-footer-legal-link" onClick={() => setLegalDoc('terms')}>Terms</button>
          <span className="lp-footer-legal-sep">·</span>
          <button className="lp-footer-legal-link" onClick={() => setLegalDoc('privacy')}>Privacy</button>
          <span className="lp-footer-legal-sep">·</span>
          <button className="lp-footer-legal-link" onClick={() => setLegalDoc('refund')}>Refunds</button>
        </div>
      </footer>

      {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
    </div>
  );
}

function NumPad({ value, onValue, onDone }) {
  const press = (char) => {
    if (char === '⌫') { onValue(value.slice(0, -1)); return; }
    if (char === '.') { if (!value.includes('.')) onValue(value + '.'); return; }
    if (char === '−') { onValue(value.startsWith('-') ? value.slice(1) : '-' + value); return; }
    onValue(value + char);
  };

  return (
    <div className="numpad-backdrop" onPointerDown={onDone}>
      <div className="numpad" onPointerDown={e => e.stopPropagation()}>
        <div className="numpad-display">{value !== '' ? `${value}°C` : '—'}</div>
        <div className="numpad-grid">
          {['7','8','9','4','5','6','1','2','3','−','0','⌫'].map(k => (
            <button key={k} className={`numpad-key${k==='⌫'?' numpad-key--del':k==='−'?' numpad-key--neg':''}`} onPointerDown={() => press(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="numpad-bottom">
          <button className="numpad-key" onPointerDown={() => press('.')}>.</button>
          <button className="numpad-done" onPointerDown={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

function StaffChecklist({ onSignOut, user, venue, hideHeader, sections: propSections, onDashboard, onSettings }) {
  const [loadedSections, setLoadedSections] = useState(null);
  const sections = propSections?.length > 0 ? propSections : (loadedSections || LOG_SECTIONS);
  const [entries, setEntries] = useState({});
  const [collapsed, setCollapsed] = useState(() => Object.fromEntries(sections.map(s => [s.id, true])));
  const [logged, setLogged] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [showNote, setShowNote] = useState({});
  const [numpadKey, setNumpadKey] = useState(null);
  const [loggedNote, setLoggedNote] = useState({});
  const [showLoggedNote, setShowLoggedNote] = useState({});

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';

  const getShift = (date = new Date()) => {
    const h = date.getHours();
    if (h >= 5  && h < 11) return 'Breakfast';
    if (h >= 11 && h < 15) return 'Lunch';
    if (h >= 15 && h < 22) return 'Dinner';
    return 'Night';
  };

  const getShiftKey = useCallback(() => {
    const now = new Date();
    const d = now.toLocaleDateString('en-AU');
    return `feja_logged_${d}_${getShift(now)}`;
  }, []);

  const currentShift = getShift();

  useEffect(() => {
    if (propSections?.length > 0 || !venue?.id) return;
    supabase.from('venues').select('sections').eq('id', venue.id).single()
      .then(({ data }) => {
        if (data?.sections?.length) {
          setLoadedSections(data.sections);
          setCollapsed(Object.fromEntries(data.sections.map(s => [s.id, true])));
        }
      });
  }, [venue?.id, propSections?.length]);

  useEffect(() => {
    const stored = localStorage.getItem(getShiftKey());
    if (stored) setLogged(JSON.parse(stored));
  }, [getShiftKey]);

  const toggleSection = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const set = (key, field, value) =>
    setEntries(prev => ({ ...prev, [key]: { temp: '', note: '', actions: [], ...prev[key], [field]: value } }));

  const toggleAction = (key, action) => {
    setEntries(prev => {
      const entry = prev[key] || { temp: '', note: '', actions: [] };
      const isOn = entry.actions.includes(action);
      return { ...prev, [key]: { ...entry, actions: isOn ? entry.actions.filter(a => a !== action) : [...entry.actions, action] } };
    });
  };

  const handleLog = async (key, section, entry) => {
    setSubmitting(prev => ({ ...prev, [key]: true }));
    const result = getResult(section.threshold, entry.temp);
    if (user.id) {
      const { error } = await supabase.from('logs').insert({
        user_id: user.id,
        user_name: displayName,
        venue_id: venue?.id || null,
        section_id: section.id,
        item: key.split('__')[1],
        temp: entry.temp !== '' ? parseFloat(entry.temp) : null,
        result,
        note: entry.note || null,
        actions: entry.actions,
        logged_at: new Date().toISOString(),
      });
      setSubmitting(prev => ({ ...prev, [key]: false }));
      if (!error) setLogged(prev => {
        const next = { ...prev, [key]: true };
        localStorage.setItem(getShiftKey(), JSON.stringify(next));
        return next;
      });
    } else {
      setSubmitting(prev => ({ ...prev, [key]: false }));
      setLogged(prev => {
        const next = { ...prev, [key]: true };
        localStorage.setItem(getShiftKey(), JSON.stringify(next));
        return next;
      });
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' });
  const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className={hideHeader ? undefined : 'screen app-screen'}>
      {!hideHeader && (
        <div className="app-hdr">
          <div className="app-hdr-center">
            <div className="app-logo">fe<span>ja</span>.</div>
            <div className="hdr-date">{dateStr} · {timeStr}</div>
          </div>
          <div className="app-hdr-bottom">
            <div className="hdr-name">Hi, {displayName}</div>
            <span className="hdr-shift">{currentShift} check</span>
            <button className="signout-pill" onClick={onSignOut}>sign out</button>
          </div>
          {(onDashboard || onSettings) && (
            <div className="app-hdr-admin-nav">
              {onDashboard && <button className="adm-nav-btn" onClick={onDashboard}>Dashboard</button>}
              {onSettings && <button className="adm-nav-btn" onClick={onSettings}>Settings</button>}
            </div>
          )}
        </div>
      )}

      <div className="log-body">
        {sections.map((section) => (
          <div key={section.id} className="log-section">
            <div className="log-section-title" onClick={() => toggleSection(section.id)}>
              <span>{section.title}</span>
              <span className={`log-chevron ${collapsed[section.id] ? 'log-chevron--up' : ''}`}>›</span>
            </div>
            {!collapsed[section.id] && section.items.map((item) => {
              const key = `${section.id}__${item}`;
              const entry = entries[key] || { temp: '', note: '', actions: [] };
              const result = getResult(section.threshold, entry.temp);
              const isLogged = !!logged[key];

              if (isLogged) {
                return (
                  <div key={key} className="log-row log-row--logged">
                    <div className="log-row-top">
                      <div className="log-row-name">{item}</div>
                      <div className="log-logged-right">
                        <span className="log-logged-temp">{entry.temp}°C</span>
                        <span className={`log-result-pill ${result === 'pass' ? 'log-result-pill--pass' : 'log-result-pill--fail'}`}>
                          {result === 'pass' ? 'Pass' : 'Fail'}
                        </span>
                        <button className="log-new-entry-btn" onClick={() => {
                          setLogged(p => { const n = { ...p }; delete n[key]; localStorage.setItem(getShiftKey(), JSON.stringify(n)); return n; });
                          setEntries(p => { const n = { ...p }; delete n[key]; return n; });
                          setShowNote(p => { const n = { ...p }; delete n[key]; return n; });
                          setShowLoggedNote(p => { const n = { ...p }; delete n[key]; return n; });
                          setLoggedNote(p => { const n = { ...p }; delete n[key]; return n; });
                        }}>Re-log</button>
                      </div>
                    </div>
                    <div className="log-logged-note-row">
                      <button className="log-note-toggle" onClick={() => setShowLoggedNote(p => ({ ...p, [key]: !p[key] }))}>
                        {showLoggedNote[key] ? '− Note' : '+ Note'}
                      </button>
                      {showLoggedNote[key] && (
                        <input
                          className="log-note-input"
                          type="text"
                          placeholder="Add a note, e.g. entry error..."
                          value={loggedNote[key] || ''}
                          onChange={e => setLoggedNote(p => ({ ...p, [key]: e.target.value }))}
                        />
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className={`log-row ${result === 'pass' ? 'log-row--pass' : result === 'fail' ? 'log-row--fail' : ''}`}>
                  <div className="log-row-top">
                    <div className="log-row-name">{item}</div>
                    <div className="log-temp-wrap">
                      <button
                        className={`log-temp-tap ${entry.temp !== '' ? 'log-temp-tap--filled' : ''}`}
                        onClick={() => setNumpadKey(key)}
                      >
                        {entry.temp !== '' ? entry.temp : '—'}
                      </button>
                      <span className="log-temp-unit">°C</span>
                      {result && (
                        <span className={`log-result-pill ${result === 'pass' ? 'log-result-pill--pass' : 'log-result-pill--fail'}`}>
                          {result === 'pass' ? 'Pass' : 'Fail'}
                        </span>
                      )}
                    </div>
                  </div>

                  {result === 'pass' && (
                    <button
                      className="log-submit-btn"
                      disabled={submitting[key]}
                      onClick={() => handleLog(key, section, entry)}
                    >
                      {submitting[key] ? 'Logging...' : 'Log'}
                    </button>
                  )}

                  {result === 'fail' && (
                    <div className="log-corrective">
                      <div className="log-corrective-title">Corrective action</div>
                      <div className="log-corrective-chips">
                        {section.correctiveActions.map(action => (
                          <button
                            key={action}
                            className={`log-chip ${entry.actions.includes(action) ? 'log-chip--on' : ''}`}
                            onClick={() => toggleAction(key, action)}
                          >{action}</button>
                        ))}
                      </div>
                      <div className="log-note-row">
                        <button className="log-note-toggle" onClick={() => setShowNote(p => ({ ...p, [key]: !p[key] }))}>
                          {showNote[key] ? '− Note' : '+ Note'}
                        </button>
                        {showNote[key] && (
                          <input
                            className="log-note-input"
                            type="text"
                            placeholder="Add a note..."
                            value={entry.note}
                            onChange={e => set(key, 'note', e.target.value)}
                          />
                        )}
                      </div>
                      <button
                        className="log-submit-btn"
                        disabled={submitting[key]}
                        onClick={() => handleLog(key, section, entry)}
                      >
                        {submitting[key] ? 'Logging...' : 'Log'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {numpadKey && (
        <NumPad
          value={entries[numpadKey]?.temp || ''}
          onValue={val => set(numpadKey, 'temp', val)}
          onDone={() => {
            const key = numpadKey;
            const sectionId = key.split('__')[0];
            const section = LOG_SECTIONS.find(s => s.id === sectionId);
            const entry = entries[key] || { temp: '', note: '', actions: [] };
            const result = getResult(section.threshold, entry.temp);
            setNumpadKey(null);
            if (result === 'pass') {
              handleLog(key, section, entry);
            }
          }}
        />
      )}
    </div>
  );
}

async function downloadCsv(from, to, label, sections, venueId) {
  let query = supabase
    .from('logs')
    .select('*')
    .gte('logged_at', from.toISOString())
    .lte('logged_at', to.toISOString())
    .order('logged_at', { ascending: true });
  if (venueId) query = query.eq('venue_id', venueId);
  const { data } = await query;
  if (!data || !data.length) return;
  const rows = [['Date', 'Time', 'Section', 'Item', 'Temp (°C)', 'Result', 'Logged By']];
  data.forEach(log => {
    const section = sections.find(s => s.id === log.section_id);
    const date = new Date(log.logged_at);
    rows.push([
      date.toLocaleDateString('en-AU'),
      date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false }),
      section?.title || log.section_id,
      log.item,
      log.temp ?? '',
      log.result,
      log.user_name || '',
    ]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `feja-${label.toLowerCase().replace(/\s+/g, '-')}.csv`;
  a.click();
}

function DashboardView({ sections, exportOpen, setExportOpen, venueId }) {
  const [openDay, setOpenDay] = useState(0);
  const [openItems, setOpenItems] = useState({});
  const [logsByDay, setLogsByDay] = useState({});
  const [exportStep, setExportStep] = useState('menu'); // 'menu' | 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const toggleItem = (key) => setOpenItems(p => ({ ...p, [key]: !p[key] }));
  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);

  useEffect(() => {
    const fetchLogs = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 4);
      since.setHours(0, 0, 0, 0);

      let query = supabase
        .from('logs')
        .select('*')
        .gte('logged_at', since.toISOString())
        .order('logged_at', { ascending: false });

      if (venueId) query = query.eq('venue_id', venueId);

      const { data } = await query;
      if (!data) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const grouped = {};
      data.forEach(log => {
        const d = new Date(log.logged_at);
        d.setHours(0, 0, 0, 0);
        const offset = Math.round((today - d) / 86400000);
        if (offset >= 0 && offset <= 4) {
          if (!grouped[offset]) grouped[offset] = [];
          const name = log.user_name || '';
          const initials = name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || '?';
          grouped[offset].push({
            time: new Date(log.logged_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false }),
            hour: new Date(log.logged_at).getHours(),
            sectionId: log.section_id,
            item: log.item,
            result: log.result,
            temp: log.temp,
            name,
            initials,
          });
        }
      });

      setLogsByDay(grouped);
    };

    fetchLogs();
  }, [venueId]);

  const getShift = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 'Breakfast';
    if (h >= 11 && h < 15) return 'Lunch';
    if (h >= 15 && h < 22) return 'Dinner';
    return 'Night';
  };

  const getShiftForHour = (h) => h >= 5 && h < 11 ? 'Breakfast' : h >= 11 && h < 15 ? 'Lunch' : h >= 15 && h < 22 ? 'Dinner' : 'Night';
  const [shiftFilters, setShiftFilters] = useState({});

  const dayLabel = (offset) => {
    if (offset === 1) return 'Yesterday';
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const todayLogs = logsByDay[0] || [];
  const todayLogged = todayLogs.length;
  const todayFails = todayLogs.filter(l => l.result === 'fail').length;
  const todayPct = totalItems > 0 ? Math.round((todayLogged / totalItems) * 100) : 0;
  const allDone = totalItems > 0 && todayLogged >= totalItems;

  const renderSections = (logs, offset) => (
    <div className="dash-day-body">
      {sections.map(section => {
        const sectionLogs = logs.filter(l => l.sectionId === section.id);
        const sectionFails = sectionLogs.filter(l => l.result === 'fail').length;
        const pending = section.items.length - sectionLogs.length;
        const status = sectionFails > 0 ? 'fail' : pending === section.items.length ? 'pending' : pending === 0 ? 'pass' : 'partial';
        return (
          <div key={section.id} className={`dash-section dash-section--${status}`}>
            <div className="dash-section-hdr-simple">
              <span className="dash-section-title">{section.title}</span>
              <span className={`dash-section-badge dash-section-badge--${status}`}>
                {status === 'fail' ? `${sectionFails} fail` : status === 'pass' ? 'All done' : status === 'pending' ? 'Pending' : `${sectionLogs.length}/${section.items.length}`}
              </span>
            </div>
            <div className="dash-section-body">
              {section.items.map((item, i) => {
                const log = sectionLogs.find(l => l.item === item);
                const itemKey = `${offset}-${section.id}-${i}`;
                const itemOpen = openItems[itemKey];
                return (
                  <div key={i} className="dash-item">
                    <div className="dash-item-hdr" onClick={() => toggleItem(itemKey)}>
                      <span className="dash-item-name">{item}</span>
                      {log
                        ? <span className={`dash-item-temp dash-item-temp--${log.result}`}>{log.temp}°C</span>
                        : <span className="dash-item-pending">—</span>
                      }
                      <span className="dash-item-time">{log ? log.time : ''}</span>
                      <div className={`dash-item-initials ${log ? '' : 'dash-item-initials--empty'}`}>{log ? log.initials : ''}</div>
                      <span className={`log-chevron dash-item-chevron ${itemOpen ? '' : 'log-chevron--up'}`}>›</span>
                    </div>
                    {itemOpen && (
                      <div className="dash-item-body">
                        {log ? (
                          <>
                            <div className="dash-item-detail">
                              <span className="dash-item-detail-lbl">Temperature</span>
                              <span className={`dash-item-detail-val dash-item-temp--${log.result}`}>{log.temp}°C · {log.result === 'pass' ? 'Pass' : 'Fail'}</span>
                            </div>
                            <div className="dash-item-detail">
                              <span className="dash-item-detail-lbl">Logged at</span>
                              <span className="dash-item-detail-val">{log.time}</span>
                            </div>
                            <div className="dash-item-detail">
                              <span className="dash-item-detail-lbl">Logged by</span>
                              <span className="dash-item-detail-val">{log.name || log.initials}</span>
                            </div>
                          </>
                        ) : (
                          <div className="dash-item-empty">
                            <span className="dash-item-empty-txt">No entry recorded</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="dash-body">

      <div className={`dash-summary${allDone && todayFails === 0 ? ' dash-summary--done' : ''}`}>
        <div className="dash-summary-top">
          <span className="dash-summary-shift">{getShift()} shift</span>
          {todayFails > 0 && <span className="dash-summary-badge">{todayFails} fail{todayFails > 1 ? 's' : ''}</span>}
          {allDone && todayFails === 0 && <span className="dash-summary-badge dash-summary-badge--done">All clear</span>}
        </div>
        <div className="dash-summary-stat">
          <span className="dash-summary-num">{todayLogged}</span>
          <span className="dash-summary-total">/{totalItems}</span>
          <span className="dash-summary-label">logged today</span>
        </div>
        <div className="dash-summary-bar">
          <div className="dash-summary-fill" style={{ width: `${todayPct}%` }} />
        </div>
        <div className="dash-section-pills">
          {sections.map(section => {
            const sLogs = todayLogs.filter(l => l.sectionId === section.id);
            const sFails = sLogs.filter(l => l.result === 'fail').length;
            const status = sFails > 0 ? 'fail' : sLogs.length === 0 ? 'pending' : sLogs.length < section.items.length ? 'partial' : 'pass';
            return <span key={section.id} className={`dash-pill dash-pill--${status}`}>{section.title}</span>;
          })}
        </div>
      </div>

      <div className="dash-day-card">
        <div className="dash-day-hdr" onClick={() => setOpenDay(openDay === 0 ? -1 : 0)}>
          <div className="dash-day-hdr-left">
            <div className="dash-day-label">Today's log</div>
            <div className="dash-day-meta">{todayLogged === 0 ? 'No entries yet' : `${todayLogged}/${totalItems} items logged`}</div>
          </div>
          <span className={`log-chevron ${openDay === 0 ? '' : 'log-chevron--up'}`}>›</span>
        </div>
        {openDay === 0 && (() => {
          const withData = [...new Set(todayLogs.map(l => getShiftForHour(l.hour)))];
          const cur = getShift();
          const tabs = [...new Set([cur, ...withData])];
          const sel = shiftFilters[0] !== undefined ? shiftFilters[0] : cur;
          const filtered = sel === 'all' ? todayLogs : todayLogs.filter(l => getShiftForHour(l.hour) === sel);
          return (
            <>
              <div className="dash-shift-tabs">
                {tabs.map(s => (
                  <button key={s} className={`dash-shift-tab${sel === s ? ' dash-shift-tab--active' : ''}`} onClick={e => { e.stopPropagation(); setShiftFilters(p => ({ ...p, 0: s })); }}>{s}</button>
                ))}
                {withData.length > 1 && <button className={`dash-shift-tab${sel === 'all' ? ' dash-shift-tab--active' : ''}`} onClick={e => { e.stopPropagation(); setShiftFilters(p => ({ ...p, 0: 'all' })); }}>All</button>}
              </div>
              {filtered.length === 0
                ? <div className="dash-empty"><span className="dash-empty-txt">Nothing logged for {sel} yet.</span></div>
                : renderSections(filtered, 0)
              }
            </>
          );
        })()}
      </div>

      {[1, 2, 3, 4].filter(offset => (logsByDay[offset] || []).length > 0).map(offset => {
        const logs = logsByDay[offset] || [];
        const logged = logs.length;
        const fails = logs.filter(l => l.result === 'fail').length;
        const isOpen = openDay === offset;
        return (
          <div key={offset} className="dash-day-card">
            <div className="dash-day-hdr" onClick={() => setOpenDay(isOpen ? -1 : offset)}>
              <div className="dash-day-hdr-left">
                <div className="dash-day-label">{dayLabel(offset)}</div>
                <div className="dash-day-meta">{logged}/{totalItems} logged · {fails > 0 ? `${fails} fail${fails > 1 ? 's' : ''}` : 'All clear'}</div>
              </div>
              <div className="dash-day-hdr-right">
                {fails > 0 && <span className="dash-section-badge dash-section-badge--fail">{fails} fail{fails > 1 ? 's' : ''}</span>}
                <span className={`log-chevron ${isOpen ? '' : 'log-chevron--up'}`}>›</span>
              </div>
            </div>
            {isOpen && (() => {
              const dayShifts = [...new Set(logs.map(l => getShiftForHour(l.hour)))];
              const sel = shiftFilters[offset] !== undefined ? shiftFilters[offset] : (dayShifts.length === 1 ? dayShifts[0] : 'all');
              const filtered = sel === 'all' ? logs : logs.filter(l => getShiftForHour(l.hour) === sel);
              return (
                <>
                  {dayShifts.length > 1 && (
                    <div className="dash-shift-tabs">
                      <button className={`dash-shift-tab${sel === 'all' ? ' dash-shift-tab--active' : ''}`} onClick={e => { e.stopPropagation(); setShiftFilters(p => ({ ...p, [offset]: 'all' })); }}>All</button>
                      {dayShifts.map(s => (
                        <button key={s} className={`dash-shift-tab${sel === s ? ' dash-shift-tab--active' : ''}`} onClick={e => { e.stopPropagation(); setShiftFilters(p => ({ ...p, [offset]: s })); }}>{s}</button>
                      ))}
                    </div>
                  )}
                  {renderSections(filtered, offset)}
                </>
              );
            })()}
          </div>
        );
      })}

      <div className="dash-export-wrap">
        <button className="dash-export-btn" onClick={() => { setExportOpen(o => !o); setExportStep('menu'); }}>Download report ▾</button>
        {exportOpen && (
          <div className="dash-export-dropdown">
            {exportStep === 'menu' && (
              <>
                {[{ label: 'Today', days: 0 }, { label: 'Last 7 days', days: 6 }, { label: 'Last 30 days', days: 29 }].map(({ label, days }) => (
                  <div key={label} className="dash-export-item" onClick={async () => {
                    setExporting(true);
                    const from = new Date(); from.setDate(from.getDate() - days); from.setHours(0,0,0,0);
                    const to = new Date(); to.setHours(23,59,59,999);
                    await downloadCsv(from, to, label, sections, venueId);
                    setExporting(false); setExportOpen(false);
                  }}>{exporting ? 'Downloading...' : label}</div>
                ))}
                <div className="dash-export-item" onClick={() => setExportStep('custom')}>Custom range →</div>
              </>
            )}
            {exportStep === 'custom' && (
              <div className="dash-export-custom">
                <div className="dash-export-custom-row">
                  <label className="dash-export-custom-lbl">From</label>
                  <input className="dash-export-date" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                </div>
                <div className="dash-export-custom-row">
                  <label className="dash-export-custom-lbl">To</label>
                  <input className="dash-export-date" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                </div>
                <div className="dash-export-custom-btns">
                  <button className="dash-export-custom-cancel" onClick={() => setExportStep('menu')}>Back</button>
                  <button className="dash-export-custom-go" disabled={!customFrom || !customTo || exporting} onClick={async () => {
                    setExporting(true);
                    const from = new Date(customFrom); from.setHours(0,0,0,0);
                    const to = new Date(customTo); to.setHours(23,59,59,999);
                    await downloadCsv(from, to, `${customFrom}-to-${customTo}`, sections, venueId);
                    setExporting(false); setExportOpen(false);
                  }}>{exporting ? 'Downloading...' : 'Download'}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ onSignOut, user, venue }) {
  const [view, setView] = useState('checklist');
  const [sections, setSections] = useState(LOG_SECTIONS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [collapsed, setCollapsed] = useState({ __items__: true, __team__: true });
  const [newItem, setNewItem] = useState({});
  const [newAction, setNewAction] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [team, setTeam] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'staff' });
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [confirmRole, setConfirmRole] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('items');
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState('cold');
  const [newSectionName, setNewSectionName] = useState('');

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

  useEffect(() => {
    if (!venue?.id) return;
    supabase
      .from('profiles')
      .select('id, name, role')
      .eq('venue_id', venue.id)
      .then(({ data }) => {
        if (data?.length) setTeam(data.map(p => ({ id: p.id, name: p.name || 'Unknown', email: '', role: p.role || 'staff' })));
      });
    supabase
      .from('venues')
      .select('sections')
      .eq('id', venue.id)
      .single()
      .then(({ data }) => {
        if (data?.sections?.length) setSections(data.sections);
      });
  }, [venue?.id]);

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    setTeam(prev => [...prev, { id: Date.now(), ...newMember }]);
    setNewMember({ name: '', email: '' });
  };

  const removeMember = (id) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    setConfirmRemove(null);
  };

  const confirmAndToggleRole = (id) => setConfirmRole(id);
  const applyRoleChange = (id) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, role: m.role === 'admin' ? 'staff' : 'admin' } : m));
    setConfirmRole(null);
  };

  const toggleSection = id => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  const updateSection = (id, field, value) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const updateThreshold = (id, field, value) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, threshold: { ...s.threshold, [field]: value === '' ? undefined : parseFloat(value) } } : s));

  const addItem = (id) => {
    const val = (newItem[id] || '').trim();
    if (!val) return;
    setSections(prev => prev.map(s => s.id === id ? { ...s, items: [...s.items, val] } : s));
    setNewItem(p => ({ ...p, [id]: '' }));
  };

  const removeItem = (id, idx) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, items: s.items.filter((_, i) => i !== idx) } : s));

  const addAction = (id) => {
    const val = (newAction[id] || '').trim();
    if (!val) return;
    setSections(prev => prev.map(s => s.id === id ? { ...s, correctiveActions: [...s.correctiveActions, val] } : s));
    setNewAction(p => ({ ...p, [id]: '' }));
  };

  const removeAction = (id, idx) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, correctiveActions: s.correctiveActions.filter((_, i) => i !== idx) } : s));

  const addSection = () => {
    const template = SECTION_TYPES[newSectionType];
    const id = `section_${Date.now()}`;
    const newSection = {
      id,
      title: newSectionName.trim() || template.label,
      type: newSectionType,
      threshold: { ...template.threshold },
      correctiveActions: [...template.correctiveActions],
      items: [],
    };
    const updated = [...sections, newSection];
    setSections(updated);
    saveSectionsData(updated);
    setAddingSection(false);
    setNewSectionName('');
    setNewSectionType('cold');
  };

  const removeSection = (id) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    saveSectionsData(updated);
  };

  const saveSectionsData = async (data) => {
    if (!venue?.id) return;
    await supabase.from('venues').update({ sections: data }).eq('id', venue.id);
  };

  const saveSections = async () => {
    if (!venue?.id) return;
    setSaving(true);
    await saveSectionsData(sections);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' });
  const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });

  const goToSettings = () => {
    setCollapsed(p => {
      const next = { ...p };
      sections.forEach(s => { next[s.id] = true; });
      return next;
    });
    setView('settings');
  };

  return (
    <div className="screen app-screen">
      {view !== 'checklist' && (
        <div className="app-hdr">
          <div className="app-hdr-center">
            <div className="app-logo">fe<span>ja</span>.</div>
            <div className="hdr-date">{dateStr} · {timeStr}</div>
          </div>
          <div className="app-hdr-bottom">
            <div className="hdr-name">Hi, {displayName}</div>
            <button className="signout-pill" onClick={onSignOut}>sign out</button>
          </div>
          <div className="app-hdr-admin-nav">
            <button className="adm-nav-btn" onClick={() => setView('checklist')}>← Log</button>
            <button className={`adm-nav-btn ${view === 'dashboard' ? 'adm-nav-btn--on' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
            <button className={`adm-nav-btn ${view === 'settings' ? 'adm-nav-btn--on' : ''}`} onClick={goToSettings}>Settings</button>
          </div>
        </div>
      )}

      {view === 'checklist' && (
        <StaffChecklist
          onSignOut={onSignOut}
          user={user}
          venue={venue}
          sections={sections}
          onDashboard={() => setView('dashboard')}
          onSettings={goToSettings}
        />
      )}

      {view === 'dashboard' && (
        <DashboardView sections={sections} exportOpen={exportOpen} setExportOpen={setExportOpen} venueId={venue?.id} />
      )}

      {view === 'settings' && (
      <div className="adm-body">

        <div className="adm-tabs">
          <button className={`adm-tab ${settingsTab === 'items' ? 'adm-tab--active' : ''}`} onClick={() => setSettingsTab('items')}>Items</button>
          <button className={`adm-tab ${settingsTab === 'team' ? 'adm-tab--active' : ''}`} onClick={() => setSettingsTab('team')}>Team</button>
        </div>

        {settingsTab === 'items' && (
          <div className="adm-tab-content">
            {sections.map(section => (
              <div key={section.id} className="adm-card">
                <div className="adm-card-hdr" onClick={() => confirmDelete !== section.id && toggleSection(section.id)}>
                  {confirmDelete === section.id ? (
                    <div className="adm-header-confirm">
                      <span className="adm-header-confirm-txt">Delete "{section.title}"?</span>
                      <button className="adm-confirm-cancel" onClick={e => { e.stopPropagation(); setConfirmDelete(null); }}>Cancel</button>
                      <button className="adm-confirm-delete" onClick={e => { e.stopPropagation(); removeSection(section.id); setConfirmDelete(null); }}>Delete</button>
                    </div>
                  ) : (
                    <>
                      <span className="adm-card-title">{section.title}</span>
                      <div className="adm-card-hdr-right">
                        <button className="adm-card-del-btn" onClick={e => { e.stopPropagation(); setConfirmDelete(section.id); }}>✕</button>
                        <span className={`log-chevron ${collapsed[section.id] ? 'log-chevron--up' : ''}`}>›</span>
                      </div>
                    </>
                  )}
                </div>

                {!collapsed[section.id] && (
                  <div className="adm-card-body">

                    {section.type === 'custom' || !section.type ? (
                      <div className="adm-group">
                        <div className="adm-group-label">Temperature Threshold</div>
                        <div className="adm-threshold-row">
                          <div className="adm-threshold-field">
                            <span className="adm-threshold-lbl">Min °C</span>
                            <input className="adm-temp-input" type="number" placeholder="—"
                              value={section.threshold.min ?? ''}
                              onChange={e => updateThreshold(section.id, 'min', e.target.value)}
                            />
                          </div>
                          <div className="adm-threshold-field">
                            <span className="adm-threshold-lbl">Max °C</span>
                            <input className="adm-temp-input" type="number" placeholder="—"
                              value={section.threshold.max ?? ''}
                              onChange={e => updateThreshold(section.id, 'max', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="adm-group">
                        <div className="adm-threshold-info">
                          {SECTION_TYPES[section.type]?.label} &middot; {section.threshold.max !== undefined ? `max ${section.threshold.max}°C` : `min ${section.threshold.min}°C`}
                        </div>
                      </div>
                    )}

                    <div className="adm-group">
                      <div className="adm-group-label">Items</div>
                      {section.items.map((item, idx) => (
                        <div key={idx} className="adm-list-row">
                          <span className="adm-list-item">{item}</span>
                          <button className="adm-remove-btn" onClick={() => removeItem(section.id, idx)}>✕</button>
                        </div>
                      ))}
                      <div className="adm-add-row">
                        <input className="adm-add-input" placeholder="Add item..."
                          value={newItem[section.id] || ''}
                          onChange={e => setNewItem(p => ({ ...p, [section.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addItem(section.id)}
                        />
                        <button className="adm-add-btn" onClick={() => addItem(section.id)}>Add</button>
                      </div>
                    </div>

                    <div className="adm-group">
                      <div className="adm-group-label">Corrective Actions</div>
                      <div className="adm-chips">
                        {section.correctiveActions.map((action, idx) => (
                          <div key={idx} className="adm-chip">
                            <span>{action}</span>
                            <button className="adm-chip-remove" onClick={() => removeAction(section.id, idx)}>✕</button>
                          </div>
                        ))}
                      </div>
                      <div className="adm-add-row">
                        <input className="adm-add-input" placeholder="Add action..."
                          value={newAction[section.id] || ''}
                          onChange={e => setNewAction(p => ({ ...p, [section.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addAction(section.id)}
                        />
                        <button className="adm-add-btn" onClick={() => addAction(section.id)}>Add</button>
                      </div>
                    </div>

                    <div className="adm-group">
                      <div className="adm-group-label">Section Name</div>
                      <input className="adm-add-input" value={section.title}
                        onChange={e => updateSection(section.id, 'title', e.target.value)}
                      />
                    </div>

                  </div>
                )}
              </div>
            ))}
            {addingSection ? (
              <div className="adm-card">
                <div className="adm-card-body">
                  <div className="adm-group-label">Section type</div>
                  <div className="adm-type-options">
                    {Object.entries(SECTION_TYPES).map(([key, val]) => (
                      <button key={key} className={`adm-type-btn ${newSectionType === key ? 'adm-type-btn--on' : ''}`} onClick={() => setNewSectionType(key)}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                  <div className="adm-group-label" style={{ marginTop: 14 }}>Name <span className="adm-optional">(optional)</span></div>
                  <input className="adm-add-input" placeholder={SECTION_TYPES[newSectionType].label}
                    value={newSectionName} onChange={e => setNewSectionName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSection()}
                  />
                  <div className="adm-confirm-btns" style={{ marginTop: 12 }}>
                    <button className="adm-confirm-cancel" onClick={() => { setAddingSection(false); setNewSectionName(''); setNewSectionType('cold'); }}>Cancel</button>
                    <button className="adm-add-btn" onClick={addSection}>Add section</button>
                  </div>
                </div>
              </div>
            ) : (
              <button className="adm-add-section-btn" onClick={() => setAddingSection(true)}>+ Section</button>
            )}
            <button className="btn-primary adm-save-btn" onClick={saveSections} disabled={saving}>
              {saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save sections'}
            </button>
          </div>
        )}

        {settingsTab === 'team' && (
          <div className="adm-tab-content">
            {venue?.id && (
              <div className="adm-invite-box">
                <div className="adm-invite-label">Invite link</div>
                <div className="adm-invite-url">{`${window.location.origin}${window.location.pathname}?invite=${venue.id}`}</div>
                <button className="adm-invite-copy" onClick={() => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?invite=${venue.id}`)}>Copy</button>
              </div>
            )}
            {team.map(member => (
              <div key={member.id} className="adm-card adm-card--flat">
                <div className="adm-member-info">
                  <div className="adm-member-name">{member.name}</div>
                  <div className="adm-member-email">{member.email}</div>
                </div>
                <div className="adm-member-actions">
                  {confirmRole === member.id ? (
                    <div className="adm-member-confirm">
                      <button className="adm-confirm-cancel" onClick={() => setConfirmRole(null)}>No</button>
                      <button className="adm-confirm-delete" onClick={() => applyRoleChange(member.id)}>Yes</button>
                    </div>
                  ) : (
                    <button className={`adm-role-pill ${member.role === 'admin' ? 'adm-role-pill--admin' : ''}`} onClick={() => confirmAndToggleRole(member.id)}>
                      {member.role === 'admin' ? 'Admin' : 'Staff'}
                    </button>
                  )}
                  {confirmRemove === member.id ? (
                    <div className="adm-member-confirm">
                      <button className="adm-confirm-cancel" onClick={() => setConfirmRemove(null)}>Cancel</button>
                      <button className="adm-confirm-delete" onClick={() => removeMember(member.id)}>Remove</button>
                    </div>
                  ) : (
                    <button className="adm-remove-btn" onClick={() => setConfirmRemove(member.id)}>✕</button>
                  )}
                </div>
              </div>
            ))}

            <div className="adm-card adm-card--flat">
              <div className="adm-member-info">
                <input className="adm-add-input" placeholder="Name" value={newMember.name}
                  onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                />
                <input className="adm-add-input" placeholder="Email" type="email" value={newMember.email}
                  style={{ marginTop: 8 }}
                  onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addMember()}
                />
              </div>
              <div className="adm-member-add-right">
                <button
                  className={`adm-role-pill ${newMember.role === 'admin' ? 'adm-role-pill--admin' : ''}`}
                  onClick={() => setNewMember(p => ({ ...p, role: p.role === 'admin' ? 'staff' : 'admin' }))}
                >
                  {newMember.role === 'admin' ? 'Admin' : 'Staff'}
                </button>
                <button className="adm-add-btn" onClick={addMember}>Add</button>
              </div>
            </div>
          </div>
        )}

        <div className="adm-subscription-row">
          <button className="adm-subscription-btn">Manage subscription</button>
        </div>

      </div>
      )}
    </div>
  );
}

const WELCOME_PHRASES = [
  { text: 'Welcome back',          pronunciation: 'wel-kum bak' },
  { text: 'Bienvenido de nuevo',   pronunciation: 'byen-veh-NEE-doh deh NWEH-voh' },
  { text: 'Benvenuto',             pronunciation: 'ben-veh-NOO-toh' },
  { text: 'Bienvenue',             pronunciation: 'byeh-veh-NOO' },
  { text: 'Willkommen',            pronunciation: 'vil-KOM-en' },
  { text: 'Bem-vindo',             pronunciation: 'beng-VEEN-doo' },
  { text: 'Καλώς ήρθες',           pronunciation: 'kah-LOS EER-thes' },
  { text: 'Welkom',                pronunciation: 'VEL-kom' },
  { text: 'Добро пожаловать',      pronunciation: 'dob-ROH pah-ZHAH-luh-vat' },
  { text: '欢迎回来',               pronunciation: 'hwahn-ying hway-lye' },
];


function App() {
  const [screen, setScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [venue, setVenue] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [welcomeIdx, setWelcomeIdx] = useState(0);
  const [welcomeFade, setWelcomeFade] = useState(true);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const loadUserData = async (authUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, venues(*)')
      .eq('id', authUser.id)
      .single();

    if (profile?.venues) setVenue(profile.venues);

    const role = profile?.role || authUser.user_metadata?.role;
    if (!role) { setScreen('login'); return; }
    setScreen(role === 'admin' ? 'admin' : 'staff');
  };

  useEffect(() => {
    const isStaging = process.env.REACT_APP_STAGING === 'true';

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        setScreen(isStaging ? 'login' : 'linktree');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setScreen('reset');
        return;
      }
      if (!session) {
        setUser(null);
        setVenue(null);
        setScreen(isStaging ? 'login' : 'linktree');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWelcomeFade(false);
      setTimeout(() => {
        setWelcomeIdx(i => (i + 1) % WELCOME_PHRASES.length);
        setWelcomeFade(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) {
      setAuthError('Invalid email or password');
      return;
    }
    setUser(data.user);
    await loadUserData(data.user);
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin });
    setForgotLoading(false);
    setForgotSent(true);
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetError('');
    const { error } = await supabase.auth.updateUser({ password: resetPassword });
    setResetLoading(false);
    if (error) { setResetError('Could not update password. Please try again.'); return; }
    await supabase.auth.signOut();
    setResetPassword('');
    setScreen('login');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setVenue(null);
    setScreen('linktree');
  };

  if (screen === null) {
    return (
      <div className="feja-app lt">
        <div className="lt-body">
          <div className="lt-wordmark">fe<span>ja</span>.</div>
        </div>
      </div>
    );
  }

  if (screen === 'linktree') {
    const inviteVenueId = new URLSearchParams(window.location.search).get('invite');
    return (
      <LandingPage
        inviteVenueId={inviteVenueId}
        onOpenApp={() => setScreen('login')}
        onDemoStaff={() => { setUser(MOCK_USER); setScreen('staff'); }}
        onDemoAdmin={() => { setUser(MOCK_USER); setScreen('admin'); }}
        onSignedUp={(newUser) => { setUser(newUser); loadUserData(newUser); }}
      />
    );
  }

  return (
    <div className="feja-app">
      {screen === 'linktree' && (
        <LandingPage
          onOpenApp={() => setScreen('login')}
          onSignedUp={(newUser) => { setUser(newUser); loadUserData(newUser); }}
        />
      )}

      {screen === 'login' && (
        <div className="screen login-page">
          <button className="login-back-btn" onClick={() => setScreen('linktree')}>←</button>
          <div className="login-top">
            <div className="login-logo-sm">
              <img src={logo} alt="Feja" />
            </div>
            <div className={`welcome-wrap ${welcomeFade ? 'welcome-in' : 'welcome-out'}`}>
              <h1 className="login-title">{WELCOME_PHRASES[welcomeIdx].text}</h1>
              <p className="welcome-pronunciation">{WELCOME_PHRASES[welcomeIdx].pronunciation}</p>
            </div>
            <p className="login-sub">Sign in to your kitchen</p>
          </div>
          <div className="login-form">
            <label className="f-lbl">Email</label>
            <input
              className="f-input"
              type="email"
              placeholder="you@venue.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label className="f-lbl">Password</label>
            <div className="pw-wrap">
              <input
                className="f-input"
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button type="button" className="pw-toggle" aria-label={showLoginPassword ? 'Hide password' : 'Show password'} onClick={() => setShowLoginPassword(p => !p)}>
                {showLoginPassword
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
            {authError && <p className="auth-error">{authError}</p>}
            <p className="forgot" onClick={() => { setForgotEmail(email); setForgotSent(false); setScreen('forgot'); }}>Forgot password?</p>
            <button className="btn-primary" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </div>
      )}

      {screen === 'forgot' && (
        <div className="screen login-page">
          <button className="login-back-btn" onClick={() => setScreen('login')}>←</button>
          <div className="login-top">
            <div className="login-logo-sm"><img src={logo} alt="Feja" /></div>
            <h1 className="login-title">Reset password</h1>
            <p className="login-sub">We'll send a reset link to your email</p>
          </div>
          <div className="login-form">
            {forgotSent ? (
              <div className="forgot-sent">
                <p>Check your inbox — a reset link is on its way to <strong>{forgotEmail}</strong>.</p>
                <button className="btn-primary" style={{marginTop: '20px'}} onClick={() => setScreen('login')}>Back to sign in</button>
              </div>
            ) : (
              <>
                <label className="f-lbl">Email</label>
                <input
                  className="f-input"
                  type="email"
                  placeholder="you@venue.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                />
                <button className="btn-primary" onClick={handleForgotPassword} disabled={forgotLoading || !forgotEmail}>
                  {forgotLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {screen === 'reset' && (
        <div className="screen login-page">
          <div className="login-top">
            <div className="login-logo-sm"><img src={logo} alt="Feja" /></div>
            <h1 className="login-title">New password</h1>
            <p className="login-sub">Choose something strong</p>
          </div>
          <div className="login-form">
            <label className="f-lbl">New password</label>
            <div className="pw-wrap">
              <input
                className="f-input"
                type={showResetPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
              />
              <button type="button" className="pw-toggle" aria-label={showResetPassword ? 'Hide password' : 'Show password'} onClick={() => setShowResetPassword(p => !p)}>
                {showResetPassword
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
            {resetError && <p className="auth-error">{resetError}</p>}
            <button className="btn-primary" onClick={handleResetPassword} disabled={resetLoading || resetPassword.length < 6}>
              {resetLoading ? 'Updating...' : 'Set new password'}
            </button>
          </div>
        </div>
      )}

      {screen === 'staff' && (
        <StaffChecklist onSignOut={handleSignOut} user={user} venue={venue} />
      )}

      {screen === 'admin' && (
        <AdminDashboard onSignOut={handleSignOut} user={user} venue={venue} />
      )}
    </div>
  );
}

export default App;
