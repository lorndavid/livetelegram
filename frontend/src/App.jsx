import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

// ── Khmer Unicode detector ────────────────────────────────────────────────────
const KHMER_RE = /[\u1780-\u17FF\u19E0-\u19FF]/;
function hasKhmer(text) { return KHMER_RE.test(text ?? ''); }

// ── Render inline Telegram formatting ────────────────────────────────────────
function renderInline(text, font) {
  const tokens = [];
  const re = /(\*\*(.+?)\*\*|__(.+?)__|\*(?!\*)(.+?)\*(?!\*)|_(.+?)_|`(.+?)`|~~(.+?)~~)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', val: text.slice(last, m.index) });
    if      (m[2] !== undefined) tokens.push({ type: 'bold',   val: m[2] });
    else if (m[3] !== undefined) tokens.push({ type: 'bold',   val: m[3] });
    else if (m[4] !== undefined) tokens.push({ type: 'italic', val: m[4] });
    else if (m[5] !== undefined) tokens.push({ type: 'italic', val: m[5] });
    else if (m[6] !== undefined) tokens.push({ type: 'code',   val: m[6] });
    else if (m[7] !== undefined) tokens.push({ type: 'strike', val: m[7] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ type: 'text', val: text.slice(last) });
  if (tokens.length === 0) return text;

  return tokens.map((tok, i) => {
    const kh = hasKhmer(tok.val);
    const f  = kh ? "'Battambang','Syne',sans-serif" : font;
    switch (tok.type) {
      case 'bold':
        return <strong key={i} style={{ fontFamily: f, fontWeight: 700, color: '#e8f8f0' }}>{tok.val}</strong>;
      case 'italic':
        return <em key={i} style={{ fontFamily: f, fontStyle: 'italic', color: '#a0d8c8' }}>{tok.val}</em>;
      case 'code':
        return (
          <code key={i} style={{
            fontFamily: "'Space Mono',monospace",
            background: 'rgba(0,255,178,0.1)',
            border: '1px solid rgba(0,255,178,0.15)',
            borderRadius: 4, padding: '1px 5px',
            fontSize: 12, color: '#00ffb2',
          }}>{tok.val}</code>
        );
      case 'strike':
        return <span key={i} style={{ fontFamily: f, textDecoration: 'line-through', opacity: 0.6 }}>{tok.val}</span>;
      default:
        return <span key={i} style={{ fontFamily: f }}>{tok.val}</span>;
    }
  });
}

// ── TelegramText — full message body renderer ─────────────────────────────────
function TelegramText({ text }) {
  if (!text) return null;
  const isKhmer    = hasKhmer(text);
  const baseFont   = isKhmer ? "'Battambang','Syne',sans-serif" : "'Syne',sans-serif";
  const baseFontSz = isKhmer ? 15 : 14;
  const paragraphs = text.split(/\n{2,}/);

  return (
    <div style={{
      fontFamily: baseFont, fontSize: baseFontSz,
      lineHeight: isKhmer ? 2 : 1.7,
      color: '#c8d8d0', wordBreak: 'break-word', textAlign: 'left',
    }}>
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n');
        return (
          <div key={pi} style={{ marginBottom: pi < paragraphs.length - 1 ? '0.75em' : 0 }}>
            {lines.map((line, li) => {
              const trimmed = line.trimStart();

              // code block fence
              if (trimmed.startsWith('```')) {
                const code = trimmed.replace(/^```\w*/, '').replace(/```$/, '').trim();
                if (code) return (
                  <pre key={li} style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '8px 12px',
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 12, color: '#00ffb2',
                    overflowX: 'auto', margin: '4px 0', whiteSpace: 'pre',
                  }}>{code}</pre>
                );
                return null;
              }

              // numbered list  1. / 1)
              const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
              if (numMatch) return (
                <div key={li} style={{ display: 'flex', gap: 8, marginBottom: 2, textAlign: 'left' }}>
                  <span style={{
                    fontFamily: "'Space Mono',monospace", fontSize: 11,
                    color: '#00ffb2', minWidth: 22, paddingTop: isKhmer ? 3 : 1, flexShrink: 0,
                  }}>{numMatch[1]}.</span>
                  <span>{renderInline(numMatch[2], baseFont)}</span>
                </div>
              );

              // bullet list  - / • / *
              const bulletMatch = trimmed.match(/^[-•*]\s+(.*)$/);
              if (bulletMatch) return (
                <div key={li} style={{ display: 'flex', gap: 8, marginBottom: 2, textAlign: 'left' }}>
                  <span style={{ color: '#00ffb2', fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>·</span>
                  <span>{renderInline(bulletMatch[1], baseFont)}</span>
                </div>
              );

              // blank line
              if (line === '') return <div key={li} style={{ minHeight: '0.5em' }}>&nbsp;</div>;

              // normal line
              return <div key={li} style={{ textAlign: 'left' }}>{renderInline(line, baseFont)}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Color palette ─────────────────────────────────────────────────────────────
const COLORS = [
  { text: '#00ffb2', avatarBg: 'rgba(0,255,178,0.15)',   border: 'rgba(0,255,178,0.18)'   },
  { text: '#a080ff', avatarBg: 'rgba(130,100,255,0.15)', border: 'rgba(130,100,255,0.18)' },
  { text: '#ffb400', avatarBg: 'rgba(255,180,0,0.13)',   border: 'rgba(255,180,0,0.18)'   },
  { text: '#00b4ff', avatarBg: 'rgba(0,180,255,0.13)',   border: 'rgba(0,180,255,0.18)'   },
  { text: '#ff508c', avatarBg: 'rgba(255,80,140,0.13)',  border: 'rgba(255,80,140,0.18)'  },
  { text: '#f97316', avatarBg: 'rgba(249,115,22,0.13)',  border: 'rgba(249,115,22,0.18)'  },
  { text: '#22d3ee', avatarBg: 'rgba(34,211,238,0.13)',  border: 'rgba(34,211,238,0.18)'  },
];
const userColorMap = {};
let colorIdx = 0;
function getColor(user) {
  if (!userColorMap[user]) userColorMap[user] = COLORS[colorIdx++ % COLORS.length];
  return userColorMap[user];
}
function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useUptime() {
  const [s, setS] = useState(0);
  useEffect(() => { const t = setInterval(() => setS(x => x + 1), 1000); return () => clearInterval(t); }, []);
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDateKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function toHHMM(iso) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}
function formatDate(key) {
  const [y, m, d] = key.split('-');
  return new Date(+y, +m - 1, +d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function parseTimeInput(val) {
  if (!val) return null;
  const [h, m] = val.split(':').map(Number);
  return h * 60 + (m || 0);
}

// ── LiveBadge ─────────────────────────────────────────────────────────────────
function LiveBadge({ connected }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: connected ? 'rgba(0,255,178,0.07)' : 'rgba(255,60,60,0.07)',
      border: `1px solid ${connected ? 'rgba(0,255,178,0.22)' : 'rgba(255,60,60,0.22)'}`,
      borderRadius: 100, padding: '6px 14px',
      fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700,
      color: connected ? '#00ffb2' : '#ff6060',
      letterSpacing: '0.1em', transition: 'all 0.4s',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: connected ? '#00ffb2' : '#ff6060',
        boxShadow: connected ? '0 0 0 3px rgba(0,255,178,0.22)' : 'none',
      }} />
      {connected ? 'LIVE' : 'OFFLINE'}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const c = getColor(name);
  const kh = hasKhmer(name);
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: c.avatarBg, border: `1px solid ${c.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: kh ? 11 : 12, color: c.text,
      fontFamily: kh ? "'Battambang',sans-serif" : "'Syne',sans-serif",
    }}>
      {getInitials(name)}
    </div>
  );
}

// ── Message ───────────────────────────────────────────────────────────────────
function Message({ msg }) {
  const c  = getColor(msg.user);
  const kh = hasKhmer(msg.user);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'msgIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      <Avatar name={msg.user} />
      <div className="bubble" style={{
        flex: 1, background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.065)',
        borderLeft: `2px solid ${c.border}`,
        borderRadius: '4px 16px 16px 16px', padding: '11px 15px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}>
          <span style={{
            fontWeight: 700, fontSize: kh ? 13 : 12, color: c.text,
            fontFamily: kh ? "'Battambang',sans-serif" : "'Syne',sans-serif",
            letterSpacing: kh ? 0 : '0.02em',
          }}>
            {msg.user}
          </span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#1e3830', flexShrink: 0 }}>
            {formatTime(msg.time)}
          </span>
        </div>
        <TelegramText text={msg.text} />

        {/* chat name tag if present */}
        {msg.chatName && (
          <div style={{
            marginTop: 7, paddingTop: 6,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontFamily: "'Space Mono',monospace", fontSize: 9,
            color: '#2a4a3a', letterSpacing: '0.06em',
          }}>
            # {msg.chatName}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────────
function FilterBar({ filters, setFilters, days, members, totalShown, total }) {
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, color: '#c8d8d0', fontFamily: "'Space Mono',monospace",
    fontSize: 11, padding: '7px 10px', outline: 'none', width: '100%', transition: 'border-color 0.2s',
  };
  const labelStyle = {
    fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#2a5040',
    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5, display: 'block',
  };
  const col = { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 };
  const hasFilter = filters.day || filters.timeFrom || filters.timeTo || filters.member;

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>

      {/* row 1 — day + member */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={col}>
          <label style={labelStyle}>📅 Day</label>
          <select value={filters.day} onChange={e => setFilters(f => ({ ...f, day: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">All days</option>
            {days.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
          </select>
        </div>
        <div style={col}>
          <label style={labelStyle}>👤 Member</label>
          <select value={filters.member} onChange={e => setFilters(f => ({ ...f, member: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">All members</option>
            {members.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* row 2 — time range */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={col}>
          <label style={labelStyle}>⏰ Time from</label>
          <input type="time" value={filters.timeFrom} onChange={e => setFilters(f => ({ ...f, timeFrom: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: '#2a5040', paddingBottom: 8, flexShrink: 0 }}>→</div>
        <div style={col}>
          <label style={labelStyle}>⏰ Time to</label>
          <input type="time" value={filters.timeTo} onChange={e => setFilters(f => ({ ...f, timeTo: e.target.value }))} style={inputStyle} />
        </div>
        {hasFilter && (
          <div style={{ flexShrink: 0, paddingBottom: 1 }}>
            <button onClick={() => setFilters({ day: '', timeFrom: '', timeTo: '', member: '' })} style={{
              background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.22)',
              borderRadius: 8, color: '#ff6060', fontFamily: "'Space Mono',monospace",
              fontSize: 10, padding: '8px 13px', cursor: 'pointer', letterSpacing: '0.05em', whiteSpace: 'nowrap',
            }}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* summary */}
      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)',
        fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#2a5040',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        Showing <span style={{ color: '#00ffb2' }}>{totalShown}</span> of <span style={{ color: '#00ffb2' }}>{total}</span> messages
        {filters.member && <span style={{ color: '#a080ff' }}>· {filters.member}</span>}
        {filters.day    && <span style={{ color: '#ffb400' }}>· {formatDate(filters.day)}</span>}
        {(filters.timeFrom || filters.timeTo) && (
          <span style={{ color: '#00b4ff' }}>· {filters.timeFrom || '00:00'} – {filters.timeTo || '23:59'}</span>
        )}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [messages,  setMessages]  = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [filters,   setFilters]   = useState({ day: '', timeFrom: '', timeTo: '', member: '' });
  const bottomRef = useRef(null);
  const uptime    = useUptime();

  useEffect(() => {
    // History arrives from MongoDB on first connect
    socket.on('history', (history) => {
      setMessages(history);
      setLoading(false);
    });

    socket.on('new_message', (msg) => {
      setMessages(prev => {
        // Avoid duplicate if somehow received twice
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('history');
      socket.off('new_message');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Derived filter options (auto-populated from real data)
  const days    = useMemo(() => [...new Set(messages.map(m => toDateKey(m.time)))].sort(), [messages]);
  const members = useMemo(() => [...new Set(messages.map(m => m.user))].sort(), [messages]);

  // Filtered messages
  const filtered = useMemo(() => {
    const fromMin = parseTimeInput(filters.timeFrom);
    const toMin   = parseTimeInput(filters.timeTo);
    return messages.filter(msg => {
      if (filters.day    && toDateKey(msg.time) !== filters.day) return false;
      if (filters.member && msg.user !== filters.member)         return false;
      const t = toHHMM(msg.time);
      if (fromMin !== null && t < fromMin) return false;
      if (toMin   !== null && t > toMin)   return false;
      return true;
    });
  }, [messages, filters]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c14; }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        select option { background: #0d1a14; color: #c8d8d0; }
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) hue-rotate(100deg); cursor: pointer;
        }
        .feed::-webkit-scrollbar { width: 4px; }
        .feed::-webkit-scrollbar-track { background: transparent; }
        .feed::-webkit-scrollbar-thumb { background: rgba(0,255,178,0.18); border-radius: 2px; }
        .bubble:hover { border-color: rgba(0,255,178,0.22) !important; }
        input:focus, select:focus { border-color: rgba(0,255,178,0.35) !important; outline: none; }
      `}</style>

      <div style={{ background: '#080c14', minHeight: '100vh', fontFamily: "'Syne',sans-serif", color: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>

        {/* Background decorations */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,200,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,200,0.022) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,255,180,0.055) 0%,transparent 70%)', top: -200, right: -100, pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(100,80,255,0.07) 0%,transparent 70%)', bottom: 0, left: -100, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto', padding: '32px 20px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '0.2em', color: '#00ffb2', textTransform: 'uppercase', marginBottom: 6, opacity: 0.8 }}>
                // real-time monitor
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.1, background: 'linear-gradient(135deg,#fff 0%,#a0f0d0 60%,#00ffb2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Telegram Live Feed
              </h1>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: '#2a5040', marginTop: 6 }}>
                socket.io · node.js · grammy · mongodb
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <LiveBadge connected={connected} />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#2a4a3a' }}>
                uptime <span style={{ color: '#00ffb2' }}>{uptime}</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,255,178,0.18),rgba(100,80,255,0.12),transparent)', marginBottom: 18 }} />

          {/* Filter bar */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            days={days}
            members={members}
            totalShown={filtered.length}
            total={messages.length}
          />

          {/* Feed */}
          <div className="feed" style={{
            background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 20, height: '55vh', overflowY: 'auto', padding: 18,
            display: 'flex', flexDirection: 'column', gap: 11,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,178,0.18) transparent',
          }}>

            {/* Loading spinner */}
            {loading ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#2a4a3a' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(0,255,178,0.15)', borderTop: '2px solid #00ffb2', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>Loading messages from database...</p>
              </div>

            ) : filtered.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#2a4a3a' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(0,255,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: 'rgba(0,255,178,0.04)' }}>
                  {messages.length === 0 ? '📡' : '🔍'}
                </div>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, textAlign: 'center', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {messages.length === 0
                    ? 'Waiting for messages from the group...\nMake sure your bot is added as admin'
                    : 'No messages match the current filters.\nTry adjusting the time range or member.'}
                </p>
              </div>

            ) : (
              filtered.map(msg => <Message key={msg.id ?? msg._id} msg={msg} />)
            )}

            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 2px' }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#2a4a3a' }}>
              <span style={{ color: '#00ffb2' }}>{filtered.length}</span> messages shown
              {filtered.length !== messages.length && <span style={{ color: '#ffb400' }}> · {messages.length} total</span>}
              <span style={{ color: '#2a4a3a', marginLeft: 8 }}>· persisted in MongoDB</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#1a2a22', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              v2.0.0 · render
            </div>
          </div>

        </div>
      </div>
    </>
  );
}