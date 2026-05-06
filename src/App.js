import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './Feja Logov1.png';

const PASS_ACTIONS = ['All good', 'Checked', 'No issues'];

const LOG_SECTIONS = [
  {
    id: 'fridge',
    title: 'Fridge Temps',
    threshold: { max: 5 },
    correctiveActions: ['Discarded', 'Supervisor notified', 'Repair logged'],
    items: ['Walk-in Fridge', 'Prep Fridge', 'Display Fridge'],
  },
  {
    id: 'reheating',
    title: 'Reheating',
    threshold: { min: 75 },
    correctiveActions: ['Reheated again', 'Discarded', 'Supervisor notified'],
    items: ['Item 1'],
  },
  {
    id: 'serving',
    title: 'Serving',
    threshold: { min: 60 },
    correctiveActions: ['Reheated', 'Discarded', 'Supervisor notified'],
    items: ['Item 1'],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    threshold: { max: 5 },
    correctiveActions: ['Rejected delivery', 'Discarded', 'Supervisor notified'],
    items: ['Delivery 1'],
  },
];

function getResult(threshold, temp) {
  if (temp === '') return null;
  const t = parseFloat(temp);
  if (isNaN(t)) return null;
  if (threshold.max !== undefined && t > threshold.max) return 'fail';
  if (threshold.min !== undefined && t < threshold.min) return 'fail';
  return 'pass';
}

function StaffChecklist({ onSignOut }) {
  const [entries, setEntries] = useState({});
  const [collapsed, setCollapsed] = useState(() => Object.fromEntries(LOG_SECTIONS.map(s => [s.id, true])));
  const [logged, setLogged] = useState({});
  const toggleSection = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const set = (key, field, value) =>
    setEntries(prev => ({ ...prev, [key]: { temp: '', note: '', actions: [], ...prev[key], [field]: value } }));

  const toggleAction = (key, action) => {
    const entry = entries[key] || { temp: '', note: '', actions: [] };
    const isOn = entry.actions.includes(action);
    const nextActions = isOn ? entry.actions.filter(a => a !== action) : [...entry.actions, action];
    const currentNote = entry.note || '';
    const nextNote = isOn ? currentNote : currentNote ? `${currentNote}, ${action}` : action;
    setEntries(prev => ({ ...prev, [key]: { ...entry, ...prev[key], actions: nextActions, note: nextNote } }));
  };

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
          <div className="hdr-name">Hi, Nando</div>
          <div />
          <button className="signout-pill" onClick={onSignOut}>sign out</button>
        </div>
      </div>

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

              return (
                <div key={key} className={`log-row ${result === 'pass' ? 'log-row--pass' : result === 'fail' ? 'log-row--fail' : ''} ${isLogged ? 'log-row--logged' : ''}`}>
                  <div className="log-row-top">
                    <div className="log-row-name">{item}</div>
                    <div className="log-temp-wrap">
                      <input
                        className="log-temp-input"
                        type="number"
                        placeholder="—"
                        value={entry.temp}
                        onChange={e => set(key, 'temp', e.target.value)}
                        disabled={isLogged}
                      />
                      <span className="log-temp-unit">°C</span>
                      {result && (
                        <span className={`log-result-pill ${result === 'pass' ? 'log-result-pill--pass' : 'log-result-pill--fail'}`}>
                          {result === 'pass' ? 'Pass' : 'Fail'}
                        </span>
                      )}
                    </div>
                  </div>

                  {result === 'pass' && !isLogged && (
                    <div className="log-corrective log-corrective--pass">
                      <div className="log-corrective-chips">
                        {PASS_ACTIONS.map(action => (
                          <button
                            key={action}
                            className={`log-chip log-chip--pass ${entry.actions.includes(action) ? 'log-chip--pass-on' : ''}`}
                            onClick={() => toggleAction(key, action)}
                          >{action}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {result === 'fail' && !isLogged && (
                    <div className="log-corrective">
                      <div className="log-corrective-title">Corrective Action</div>
                      <div className="log-corrective-chips">
                        {section.correctiveActions.map(action => (
                          <button
                            key={action}
                            className={`log-chip ${entry.actions.includes(action) ? 'log-chip--on' : ''}`}
                            onClick={() => toggleAction(key, action)}
                          >{action}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    className="log-note-input"
                    type="text"
                    placeholder="Notes..."
                    value={entry.note}
                    onChange={e => set(key, 'note', e.target.value)}
                    disabled={isLogged}
                  />

                  {result && !isLogged && (
                    <button
                      className="log-submit-btn"
                      onClick={() => setLogged(prev => ({ ...prev, [key]: true }))}
                    >Log and tick off</button>
                  )}

                  {isLogged && (
                    <div className="log-ticked">Logged ✓</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardView({ sections, exportOpen, setExportOpen }) {
  const [openDay, setOpenDay] = useState(0);
  const [openItems, setOpenItems] = useState({});
  const toggleItem = (key) => setOpenItems(p => ({ ...p, [key]: !p[key] }));
  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);

  const dayLabel = (offset) => {
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Yesterday';
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="dash-body">

      {[0, 1, 2, 3, 4].map(offset => {
        const logs = MOCK_LOGS_BY_DAY[offset] || [];
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
            <div className="dash-export-item">📧 Email report</div>
            <div className="dash-export-item">📄 Download PDF</div>
            <div className="dash-export-item">📊 Download CSV</div>
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_LOGS_BY_DAY = {
  0: [
    { time: '14:32', sectionId: 'fridge',    item: 'Walk-in Fridge', result: 'pass', temp: 3,  initials: 'NA' },
    { time: '14:28', sectionId: 'delivery',  item: 'Delivery 1',     result: 'pass', temp: 4,  initials: 'NA' },
    { time: '13:55', sectionId: 'reheating', item: 'Item 1',         result: 'pass', temp: 78, initials: 'NA' },
    { time: '12:10', sectionId: 'fridge',    item: 'Prep Fridge',    result: 'fail', temp: 8,  initials: 'NA' },
  ],
  1: [
    { time: '16:45', sectionId: 'fridge',    item: 'Walk-in Fridge', result: 'pass', temp: 4,  initials: 'NA' },
    { time: '16:40', sectionId: 'fridge',    item: 'Prep Fridge',    result: 'pass', temp: 3,  initials: 'NA' },
    { time: '15:10', sectionId: 'reheating', item: 'Item 1',         result: 'pass', temp: 76, initials: 'NA' },
    { time: '14:55', sectionId: 'serving',   item: 'Item 1',         result: 'pass', temp: 63, initials: 'NA' },
    { time: '13:20', sectionId: 'delivery',  item: 'Delivery 1',     result: 'pass', temp: 5,  initials: 'NA' },
  ],
  2: [
    { time: '15:30', sectionId: 'fridge',    item: 'Walk-in Fridge', result: 'fail', temp: 9,  initials: 'NA' },
    { time: '15:25', sectionId: 'fridge',    item: 'Prep Fridge',    result: 'pass', temp: 4,  initials: 'NA' },
    { time: '14:00', sectionId: 'reheating', item: 'Item 1',         result: 'pass', temp: 80, initials: 'NA' },
    { time: '11:15', sectionId: 'delivery',  item: 'Delivery 1',     result: 'fail', temp: 8,  initials: 'NA' },
  ],
  3: [
    { time: '17:00', sectionId: 'fridge',    item: 'Walk-in Fridge', result: 'pass', temp: 3,  initials: 'NA' },
    { time: '16:55', sectionId: 'fridge',    item: 'Prep Fridge',    result: 'pass', temp: 4,  initials: 'NA' },
    { time: '16:50', sectionId: 'fridge',    item: 'Display Fridge', result: 'pass', temp: 2,  initials: 'NA' },
    { time: '15:30', sectionId: 'serving',   item: 'Item 1',         result: 'pass', temp: 65, initials: 'NA' },
    { time: '14:10', sectionId: 'delivery',  item: 'Delivery 1',     result: 'pass', temp: 3,  initials: 'NA' },
  ],
  4: [
    { time: '14:00', sectionId: 'fridge',    item: 'Walk-in Fridge', result: 'pass', temp: 4,  initials: 'NA' },
    { time: '13:50', sectionId: 'reheating', item: 'Item 1',         result: 'fail', temp: 68, initials: 'NA' },
    { time: '13:20', sectionId: 'delivery',  item: 'Delivery 1',     result: 'pass', temp: 4,  initials: 'NA' },
  ],
};

function AdminDashboard({ onSignOut }) {
  const [view, setView] = useState('dashboard');
  const [sections, setSections] = useState(LOG_SECTIONS.map(s => ({ ...s, items: [...s.items], correctiveActions: [...s.correctiveActions] })));
  const [collapsed, setCollapsed] = useState(() => ({
    ...Object.fromEntries(LOG_SECTIONS.map(s => [`dash_${s.id}`, true])),
    __items__: true,
    __team__: true,
  }));
  const [newItem, setNewItem] = useState({});
  const [newAction, setNewAction] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [team, setTeam] = useState([
    { id: 1, name: 'Nando', email: 'nando@venue.com', role: 'staff' },
  ]);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'staff' });
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [confirmRole, setConfirmRole] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

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
    const id = `section_${Date.now()}`;
    setSections(prev => [...prev, { id, title: 'New Section', threshold: { max: 5 }, items: [], correctiveActions: [] }]);
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
          <div className="hdr-name">Hi, Admin</div>
          <button className="adm-settings-btn" onClick={() => setView(v => v === 'settings' ? 'dashboard' : 'settings')}>
            {view === 'settings' ? 'Close' : 'Settings'}
          </button>
          <button className="signout-pill" onClick={onSignOut}>sign out</button>
        </div>
      </div>

      {view === 'dashboard' && (
        <DashboardView sections={sections} exportOpen={exportOpen} setExportOpen={setExportOpen} />
      )}

      {view === 'settings' && (
      <div className="adm-body">

        {/* Items collapsible */}
        <div className="adm-section">
          <div className="adm-section-hdr" onClick={() => toggleSection('__items__')}>
            <span className="adm-section-title">Items</span>
            <span className={`log-chevron ${collapsed['__items__'] ? 'log-chevron--up' : ''}`}>›</span>
          </div>
          {!collapsed['__items__'] && (
            <div className="adm-section-body">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <button className="adm-add-section-btn" onClick={addSection}>+ Section</button>
              </div>
        {sections.map(section => (
          <div key={section.id} className="adm-section">
            <div className="adm-section-hdr" onClick={() => toggleSection(section.id)}>
              <span className="adm-section-title">{section.title}</span>
              <span className={`log-chevron ${collapsed[section.id] ? 'log-chevron--up' : ''}`}>›</span>
            </div>

            {!collapsed[section.id] && (
              <div className="adm-section-body">

                <div className="adm-group">
                  <div className="adm-group-label">Temperature Threshold</div>
                  <div className="adm-threshold-row">
                    <div className="adm-threshold-field">
                      <span className="adm-threshold-lbl">Min °C</span>
                      <input
                        className="adm-temp-input"
                        type="number"
                        placeholder="—"
                        value={section.threshold.min ?? ''}
                        onChange={e => updateThreshold(section.id, 'min', e.target.value)}
                      />
                    </div>
                    <div className="adm-threshold-field">
                      <span className="adm-threshold-lbl">Max °C</span>
                      <input
                        className="adm-temp-input"
                        type="number"
                        placeholder="—"
                        value={section.threshold.max ?? ''}
                        onChange={e => updateThreshold(section.id, 'max', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-group">
                  <div className="adm-group-label">Items</div>
                  {section.items.map((item, idx) => (
                    <div key={idx} className="adm-list-row">
                      <span className="adm-list-item">{item}</span>
                      <button className="adm-remove-btn" onClick={() => removeItem(section.id, idx)}>✕</button>
                    </div>
                  ))}
                  <div className="adm-add-row">
                    <input
                      className="adm-add-input"
                      placeholder="Add item..."
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
                    <input
                      className="adm-add-input"
                      placeholder="Add action..."
                      value={newAction[section.id] || ''}
                      onChange={e => setNewAction(p => ({ ...p, [section.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addAction(section.id)}
                    />
                    <button className="adm-add-btn" onClick={() => addAction(section.id)}>Add</button>
                  </div>
                </div>

                <div className="adm-group">
                  <div className="adm-group-label">Edit Section Name</div>
                  <input
                    className="adm-add-input"
                    value={section.title}
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
                    <button className="adm-delete-section-btn" onClick={() => setConfirmDelete(section.id)}>
                      Delete section
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        ))}
            </div>
          )}
        </div>

        {/* Team collapsible */}
        <div className="adm-section">
          <div className="adm-section-hdr" onClick={() => toggleSection('__team__')}>
            <span className="adm-section-title">Team</span>
            <span className={`log-chevron ${collapsed['__team__'] ? 'log-chevron--up' : ''}`}>›</span>
          </div>
          {!collapsed['__team__'] && (
          <div>
          {team.map(member => (
            <div key={member.id} className="adm-member-row">
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
                  <button
                    className={`adm-role-pill ${member.role === 'admin' ? 'adm-role-pill--admin' : ''}`}
                    onClick={() => confirmAndToggleRole(member.id)}
                  >
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

          <div className="adm-member-add">
            <input
              className="adm-add-input"
              placeholder="Name"
              value={newMember.name}
              onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
            />
            <input
              className="adm-add-input"
              placeholder="Email"
              type="email"
              value={newMember.email}
              onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))}
            />
            <button className="adm-add-btn" onClick={addMember}>Add</button>
          </div>
          </div>
          )}
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

const SPIN_STYLES = ['spin-rotate', 'spin-flip', 'spin-bounce'];

function App() {
  const [screen, setScreen] = useState('landing');
  const [spinning, setSpinning] = useState(false);
  const [spinStyle] = useState(() => SPIN_STYLES[Math.floor(Math.random() * SPIN_STYLES.length)]);
  const [welcomeIdx, setWelcomeIdx] = useState(0);
  const [welcomeFade, setWelcomeFade] = useState(true);

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

  const goToLogin = () => {
    setSpinning(true);
    setTimeout(() => {
      setScreen('login');
      setSpinning(false);
    }, 600);
  };

  return (
    <div className="feja-app">
      {screen === 'landing' && (
        <div className="screen land">
          <div className="land-top">
            <div
              className={`logo-btn ${spinning ? spinStyle : ''}`}
              onClick={goToLogin}
            >
              <img src={logo} alt="Feja" />
            </div>
            <p className="tap-hint">↑ tap to sign in</p>
          </div>
          <div className="land-bottom">
            <div className="land-wordmark">fe<span>ja</span>.</div>
            <p className="tagline">Less paperwork, more cooking.</p>
          </div>
        </div>
      )}

      {screen === 'login' && (
        <div className="screen login-page">
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
            <input className="f-input" type="email" placeholder="you@venue.com" />
            <label className="f-lbl">Password</label>
            <input className="f-input" type="password" placeholder="••••••••" />
            <p className="forgot">Forgot password?</p>
            <button className="btn-primary" onClick={() => setScreen('staff')}>
              Sign in
            </button>
          </div>
          <div className="login-footer">
            <p className="back-link" onClick={() => setScreen('landing')}>← Back</p>
            <p className="admin-link" onClick={() => setScreen('admin')}>Demo: Admin view →</p>
          </div>
        </div>
      )}


      {screen === 'staff' && (
        <StaffChecklist onSignOut={() => setScreen('landing')} />
      )}

      {screen === 'admin' && (
        <AdminDashboard onSignOut={() => setScreen('landing')} />
      )}
    </div>
  );
}

export default App;