import React, { useState, useEffect } from 'react';
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

function LandingPage({ onOpenApp, onDemoStaff, onDemoAdmin, onSignedUp }) {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSignUp = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) return;
    setFormLoading(true);
    setFormError('');
    const { data, error } = await supabase.auth.signUp({
      email: formEmail.trim(),
      password: formPassword.trim(),
      options: { data: { name: formName.trim() } },
    });
    setFormLoading(false);
    if (error) { setFormError(error.message); return; }
    if (data?.user) onSignedUp(data.user);
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
            <input className="f-input" placeholder="Your name" value={formName} onChange={e => setFormName(e.target.value)} />
            <input className="f-input" type="email" placeholder="Email address" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
            <input className="f-input" type="password" placeholder="Choose a password" value={formPassword} onChange={e => setFormPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignUp()} />
            {formError && <p className="auth-error">{formError}</p>}
            <button className="lp-btn-primary" onClick={handleSignUp} disabled={formLoading}>
              {formLoading ? 'Creating account...' : 'Create account'}
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
      </footer>

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

function StaffChecklist({ onSignOut, user, venue, hideHeader }) {
  const [entries, setEntries] = useState({});
  const [collapsed, setCollapsed] = useState(() => Object.fromEntries(LOG_SECTIONS.map(s => [s.id, true])));
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

  const getShiftKey = () => {
    const now = new Date();
    const d = now.toLocaleDateString('en-AU');
    return `feja_logged_${d}_${getShift(now)}`;
  };

  const currentShift = getShift();

  useEffect(() => {
    const stored = localStorage.getItem(getShiftKey());
    if (stored) setLogged(JSON.parse(stored));
  }, []);

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
        </div>
      )}

      <div className="log-body">
        {LOG_SECTIONS.map((section) => (
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

function DashboardView({ sections, exportOpen, setExportOpen, venueId }) {
  const [openDay, setOpenDay] = useState(0);
  const [openItems, setOpenItems] = useState({});
  const [logsByDay, setLogsByDay] = useState({});
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
            sectionId: log.section_id,
            item: log.item,
            result: log.result,
            temp: log.temp,
            initials,
          });
        }
      });

      setLogsByDay(grouped);
    };

    fetchLogs();
  }, [venueId]);

  const dayLabel = (offset) => {
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Yesterday';
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="dash-body">
      {[0, 1, 2, 3, 4].filter(offset => offset === 0 || (logsByDay[offset] || []).length > 0).map(offset => {
        const logs = logsByDay[offset] || [];
        const loggedItems = logs.length;
        const pct = Math.round((loggedItems / totalItems) * 100);
        const fails = logs.filter(l => l.result === 'fail').length;
        const isOpen = openDay === offset;

        return (
          <div key={offset} className="dash-day-card">
            <div className="dash-day-hdr" onClick={() => setOpenDay(isOpen ? -1 : offset)}>
              <div className="dash-day-hdr-left">
                <div className="dash-day-label">{dayLabel(offset)}</div>
                <div className="dash-day-meta">{loggedItems}/{totalItems} logged{fails > 0 ? ` · ${fails} fail${fails > 1 ? 's' : ''}` : ''}</div>
              </div>
              <div className="dash-day-hdr-right">
                {fails > 0 && <span className="dash-section-badge dash-section-badge--fail">{fails} fail{fails > 1 ? 's' : ''}</span>}
                <span className={`log-chevron ${isOpen ? '' : 'log-chevron--up'}`}>›</span>
              </div>
            </div>

            {isOpen && (
              <div className="dash-day-body">
                <div className="dash-progress-row">
                  <div className="dash-progress-bar">
                    <div className="dash-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="dash-progress-label">{loggedItems}/{totalItems}</span>
                </div>

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
                                        <span className="dash-item-detail-val">{log.initials}</span>
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
            )}
          </div>
        );
      })}

      <button className="dash-view-more">View more</button>

      <div className="dash-export-wrap">
        <button className="dash-export-btn" onClick={() => setExportOpen(o => !o)}>Export ▾</button>
        {exportOpen && (
          <div className="dash-export-dropdown">
            <div className="dash-export-item">Email report</div>
            <div className="dash-export-item">Download PDF</div>
            <div className="dash-export-item">Download CSV</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ onSignOut, user, venue }) {
  const [view, setView] = useState('dashboard');
  const [sections, setSections] = useState(LOG_SECTIONS.map(s => ({ ...s, items: [...s.items], correctiveActions: [...s.correctiveActions] })));
  const [collapsed, setCollapsed] = useState(() => ({
    ...Object.fromEntries(LOG_SECTIONS.map(s => [`dash_${s.id}`, true])),
    ...Object.fromEntries(LOG_SECTIONS.map(s => [s.id, true])),
    __items__: true,
    __team__: true,
  }));
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
    setSections(prev => [...prev, {
      id,
      title: newSectionName.trim() || template.label,
      type: newSectionType,
      threshold: { ...template.threshold },
      correctiveActions: [...template.correctiveActions],
      items: [],
    }]);
    setAddingSection(false);
    setNewSectionName('');
    setNewSectionType('cold');
  };

  const removeSection = (id) => setSections(prev => prev.filter(s => s.id !== id));

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' });
  const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="screen app-screen">
      <div className="app-hdr">
        <div className="app-hdr-center">
          <div className="app-logo">fe<span>ja</span>.</div>
          <div className="hdr-date">{dateStr} · {timeStr}</div>
        </div>
        <div className="app-hdr-bottom">
          <button className={`adm-nav-btn ${view === 'dashboard' ? 'adm-nav-btn--on' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={`adm-nav-btn ${view === 'log' ? 'adm-nav-btn--on' : ''}`} onClick={() => setView('log')}>Log</button>
          <button className={`adm-nav-btn ${view === 'settings' ? 'adm-nav-btn--on' : ''}`} onClick={() => {
            if (view !== 'settings') {
              setCollapsed(p => {
                const next = { ...p };
                sections.forEach(s => { next[s.id] = true; });
                return next;
              });
            }
            setView(v => v === 'settings' ? 'dashboard' : 'settings');
          }}>Settings</button>
          <button className="signout-pill" onClick={onSignOut}>sign out</button>
        </div>
      </div>

      {view === 'dashboard' && (
        <DashboardView sections={sections} exportOpen={exportOpen} setExportOpen={setExportOpen} venueId={venue?.id} />
      )}

      {view === 'log' && (
        <StaffChecklist onSignOut={onSignOut} user={user} venue={venue} hideHeader />
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
                <div className="adm-card-hdr" onClick={() => toggleSection(section.id)}>
                  <span className="adm-card-title">{section.title}</span>
                  <span className={`log-chevron ${collapsed[section.id] ? 'log-chevron--up' : ''}`}>›</span>
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
                      {confirmDelete === section.id ? (
                        <div className="adm-confirm">
                          <p className="adm-confirm-text">Delete "{section.title}"?</p>
                          <div className="adm-confirm-btns">
                            <button className="adm-confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="adm-confirm-delete" onClick={() => { removeSection(section.id); setConfirmDelete(null); }}>Delete</button>
                          </div>
                        </div>
                      ) : (
                        <button className="adm-delete-section-btn" onClick={() => setConfirmDelete(section.id)}>Delete section</button>
                      )}
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
          </div>
        )}

        {settingsTab === 'team' && (
          <div className="adm-tab-content">
            {team.map(member => (
              <div key={member.id} className="adm-card adm-card--flat">
                <div className="adm-member-info">
                  <div className="adm-member-name">{member.name}</div>
                  <div className="adm-member-email">{member.email}</div>
                </div>
                <div className="adm-member-actions">
                  {confirmRole === member.id ? (
                    <div className="adm-member-confirm">
                      <span className="adm-confirm-label">{member.role === 'admin' ? 'Remove admin?' : 'Make admin?'}</span>
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

function Onboarding({ user, onDone }) {
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { name: name.trim(), role } });
    await supabase.from('profiles').upsert({ id: user.id, name: name.trim(), role });
    setSaving(false);
    onDone(role);
  };

  return (
    <div className="screen onb-screen">
      <div className="onb-logo">fe<span>ja</span>.</div>
      <h1 className="onb-title">Welcome to Feja</h1>
      <p className="onb-sub">Quick setup before you get started.</p>

      <div className="onb-form">
        <label className="f-lbl">Your name</label>
        <input className="f-input" placeholder="e.g. Jaye" value={name} onChange={e => setName(e.target.value)} />

        <label className="f-lbl" style={{ marginTop: 20 }}>Your role</label>
        <div className="onb-role-row">
          <button className={`onb-role-btn ${role === 'staff' ? 'onb-role-btn--on' : ''}`} onClick={() => setRole('staff')}>
            <span className="onb-role-title">Staff</span>
            <span className="onb-role-desc">Log temps and checks</span>
          </button>
          <button className={`onb-role-btn ${role === 'admin' ? 'onb-role-btn--on' : ''}`} onClick={() => setRole('admin')}>
            <span className="onb-role-title">Admin</span>
            <span className="onb-role-desc">Dashboard and settings</span>
          </button>
        </div>

        <button className="btn-primary" style={{ marginTop: 28 }} onClick={handleStart} disabled={saving || !name.trim()}>
          {saving ? 'Setting up...' : 'Get started'}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [venue, setVenue] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [welcomeIdx, setWelcomeIdx] = useState(0);
  const [welcomeFade, setWelcomeFade] = useState(true);

  const loadUserData = async (authUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, venues(*)')
      .eq('id', authUser.id)
      .single();

    if (profile?.venues) setVenue(profile.venues);

    const role = profile?.role || authUser.user_metadata?.role;
    if (!role) { setScreen('onboarding'); return; }
    setScreen(role === 'admin' ? 'admin' : 'staff');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        setScreen('linktree');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setVenue(null);
        setScreen('linktree');
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
    return (
      <LandingPage
        onOpenApp={() => setScreen('login')}
        onDemoStaff={() => { setUser(MOCK_USER); setScreen('staff'); }}
        onDemoAdmin={() => { setUser(MOCK_USER); setScreen('admin'); }}
        onSignedUp={(newUser) => { setUser(newUser); setScreen('onboarding'); }}
      />
    );
  }

  return (
    <div className="feja-app">
      {screen === 'linktree' && (
        <LandingPage
          onOpenApp={() => setScreen('login')}
          onSignedUp={(newUser) => { setUser(newUser); setScreen('onboarding'); }}
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
            <input
              className="f-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            {authError && <p className="auth-error">{authError}</p>}
            <p className="forgot">Forgot password?</p>
            <button className="btn-primary" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </div>
      )}

      {screen === 'onboarding' && (
        <Onboarding user={user} onDone={() => loadUserData(user)} />
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
