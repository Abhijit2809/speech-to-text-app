import { useState, useRef } from 'react';
import { Mic, Upload, Copy, Clock, Square, FileAudio, CheckCheck, Loader2, Zap, Activity } from 'lucide-react';

/* ─────────────── Inline keyframe styles injected once ─────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --bg-void:    #03030a;
    --bg-deep:    #07071a;
    --bg-card:    rgba(255,255,255,0.028);
    --bg-card-h:  rgba(255,255,255,0.048);
    --border:     rgba(255,255,255,0.06);
    --border-h:   rgba(120,80,255,0.35);
    --accent:     #7c4dff;
    --accent-2:   #3d9bff;
    --accent-hot: #ff4da6;
    --glow-v:     rgba(124,77,255,0.18);
    --glow-b:     rgba(61,155,255,0.14);
    --text-1:     rgba(255,255,255,0.92);
    --text-2:     rgba(255,255,255,0.45);
    --text-3:     rgba(255,255,255,0.18);
    --emerald:    #00e5a0;
    --red:        #ff4466;
  }

  body { margin:0; background: var(--bg-void); font-family: 'Syne', sans-serif; }
  
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,77,255,0.3); border-radius: 99px; }

  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: .6; }
    70%  { transform: scale(1.9); opacity: 0;  }
    100% { transform: scale(1.9); opacity: 0;  }
  }
  @keyframes pulse-ring2 {
    0%   { transform: scale(1);   opacity: .4; }
    70%  { transform: scale(2.4); opacity: 0;  }
    100% { transform: scale(2.4); opacity: 0;  }
  }
  @keyframes bar-dance {
    0%,100% { transform: scaleY(0.3); }
    50%     { transform: scaleY(1);   }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes scan-line {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes float-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes holo-flicker {
    0%,100% { opacity: 1; }
    92%     { opacity: 1; }
    93%     { opacity: 0.7; }
    94%     { opacity: 1; }
    97%     { opacity: 0.85; }
    98%     { opacity: 1; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes grid-move {
    from { background-position: 0 0; }
    to   { background-position: 40px 40px; }
  }
  @keyframes neon-pulse {
    0%,100% { box-shadow: 0 0 12px var(--accent), 0 0 24px var(--glow-v); }
    50%     { box-shadow: 0 0 20px var(--accent), 0 0 48px var(--glow-v), 0 0 60px rgba(124,77,255,0.12); }
  }

  .animate-float-in     { animation: float-in .4s ease both; }
  .animate-holo         { animation: holo-flicker 8s ease-in-out infinite; }
  .animate-neon-pulse   { animation: neon-pulse 2.5s ease-in-out infinite; }
  .animate-spin-slow    { animation: spin-slow 8s linear infinite; }
`;

/* ─── Small reusable bits ─── */
function CyberDot({ color = 'var(--emerald)' }) {
  return (
    <span style={{
      display:'inline-block', width:7, height:7,
      borderRadius:'50%', background: color,
      boxShadow: `0 0 6px ${color}, 0 0 12px ${color}`,
      flexShrink: 0,
    }} />
  );
}

function GlowLine({ color = 'var(--accent)', opacity = 0.4 }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${color} 40%, ${color} 60%, transparent)`,
      opacity,
    }} />
  );
}

/* ─── Waveform bars (animated while recording) ─── */
const BAR_HEIGHTS = [4,8,14,10,18,7,12,5,16,9,13,6,11,15,8,4,10,7,14,9];
function WaveformBars() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3, height:28, marginTop:12 }}>
      {BAR_HEIGHTS.map((h, i) => (
        <div key={i} style={{
          width:3, height: h*1.5, borderRadius:2,
          background: `linear-gradient(to top, var(--red), var(--accent-hot))`,
          transformOrigin: 'bottom',
          animation: `bar-dance ${400 + (i%5)*120}ms ease-in-out infinite`,
          animationDelay: `${i * 60}ms`,
          boxShadow: '0 0 4px rgba(255,68,102,0.5)',
        }} />
      ))}
    </div>
  );
}

/* ─── Skeleton loader ─── */
function SkeletonLines() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {[92,75,58].map((w,i) => (
        <div key={i} style={{
          height:13, width:`${w}%`, borderRadius:6,
          background: `linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)`,
          backgroundSize:'400px 100%',
          animation: `shimmer 1.6s ease-in-out infinite`,
          animationDelay: `${i*200}ms`,
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════════════ */
function App() {
  const [isRecording, setIsRecording]       = useState(false);
  const [transcription, setTranscription]   = useState('');
  const [loading, setLoading]               = useState(false);
  const [history, setHistory]               = useState([]);
  const [copied, setCopied]                 = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);

  /* ── unchanged logic ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current   = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        uploadAudio(blob, 'Voice Recording.webm');
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert('Microphone access denied. Please allow permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (file, filename = 'Uploaded File') => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);
    try {
      const res  = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const newEntry = { id: Date.now(), text: data.transcription, filename, date: new Date().toLocaleTimeString() };
        setTranscription(data.transcription);
        setHistory(prev => [newEntry, ...prev]);
        setActiveHistoryId(newEntry.id);
      } else {
        alert(data.error || 'Transcription failed');
      }
    } catch {
      alert('Cannot connect to backend. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistoryClick = (item) => {
    setTranscription(item.text);
    setActiveHistoryId(item.id);
  };

  /* ──────────────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* Moving grid background */}
      <div style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:`
          linear-gradient(rgba(124,77,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,77,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize:'40px 40px',
        animation:'grid-move 6s linear infinite',
      }} />

      {/* Ambient glow orbs */}
      <div style={{
        position:'fixed', top:-160, left:-100, width:520, height:520,
        borderRadius:'50%', zIndex:0, pointerEvents:'none',
        background:'radial-gradient(circle, rgba(124,77,255,0.08) 0%, transparent 70%)',
      }} />
      <div style={{
        position:'fixed', bottom:-120, right:80, width:420, height:420,
        borderRadius:'50%', zIndex:0, pointerEvents:'none',
        background:'radial-gradient(circle, rgba(61,155,255,0.06) 0%, transparent 70%)',
      }} />

      <div style={{
        minHeight:'100vh', display:'flex', position:'relative', zIndex:1,
        fontFamily:"'Syne', sans-serif",
      }}>

        {/* ═══════════════════ SIDEBAR ═══════════════════ */}
        <aside style={{
          width:288, flexShrink:0,
          background:`linear-gradient(180deg, rgba(12,10,30,0.95) 0%, rgba(7,7,20,0.98) 100%)`,
          borderRight:'1px solid var(--border)',
          display:'flex', flexDirection:'column',
          backdropFilter:'blur(20px)',
          position:'relative', overflow:'hidden',
        }}>
          {/* Sidebar vertical accent line */}
          <div style={{
            position:'absolute', top:0, right:-1, bottom:0, width:1,
            background:'linear-gradient(180deg, transparent, var(--accent) 40%, var(--accent-2) 60%, transparent)',
            opacity:0.3,
          }} />

          {/* Logo */}
          <div style={{ padding:'24px 24px 20px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:'linear-gradient(135deg, var(--accent), var(--accent-2))',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 16px var(--glow-v)',
                position:'relative',
              }}>
                <Mic size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, letterSpacing:'.04em', color:'var(--text-1)' }}>
                  VoiceScript
                </div>
                <div style={{ fontSize:10, color:'var(--accent)', letterSpacing:'.12em', fontFamily:"'JetBrains Mono', monospace", marginTop:1 }}>
                  AI · TRANSCRIBE
                </div>
              </div>
            </div>
          </div>

          {/* History header */}
          <div style={{ padding:'20px 20px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <Clock size={12} color="var(--text-3)" />
              <span style={{ fontSize:10, letterSpacing:'.14em', color:'var(--text-3)', fontWeight:600, textTransform:'uppercase' }}>
                History
              </span>
            </div>
            {history.length > 0 && (
              <span style={{
                fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                background:'rgba(124,77,255,0.15)', color:'var(--accent)',
                border:'1px solid rgba(124,77,255,0.25)',
                fontFamily:"'JetBrains Mono', monospace",
              }}>
                {history.length}
              </span>
            )}
          </div>

          {/* History list */}
          <div style={{ flex:1, overflowY:'auto', padding:'4px 12px 20px' }}>
            {history.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:160, textAlign:'center', padding:'0 16px' }}>
                <div style={{
                  width:44, height:44, borderRadius:14, marginBottom:12,
                  background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <FileAudio size={18} color="var(--text-3)" />
                </div>
                <p style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6, margin:0 }}>
                  No transcriptions yet.<br />Start recording to begin.
                </p>
              </div>
            ) : (
              history.map((item, idx) => (
                <button key={item.id} onClick={() => handleHistoryClick(item)}
                  style={{
                    width:'100%', textAlign:'left', padding:'10px 12px', borderRadius:10, cursor:'pointer',
                    marginBottom:4,
                    background: activeHistoryId === item.id ? 'rgba(124,77,255,0.12)' : 'transparent',
                    border: activeHistoryId === item.id ? '1px solid rgba(124,77,255,0.22)' : '1px solid transparent',
                    transition:'all .2s ease',
                    animation:`float-in .3s ease both`,
                    animationDelay:`${idx * 40}ms`,
                  }}
                  onMouseEnter={e => {
                    if (activeHistoryId !== item.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeHistoryId !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{
                      fontSize:10, fontWeight:600, color: activeHistoryId === item.id ? 'var(--accent)' : 'var(--text-3)',
                      fontFamily:"'JetBrains Mono', monospace", letterSpacing:'.04em',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120,
                    }}>
                      {item.filename}
                    </span>
                    <span style={{ fontSize:9, color:'var(--text-3)', flexShrink:0, marginLeft:4, fontFamily:"'JetBrains Mono', monospace" }}>
                      {item.date}
                    </span>
                  </div>
                  <p style={{
                    fontSize:11, color:'var(--text-2)', lineHeight:1.55, margin:0,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                  }}>
                    {item.text}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Sidebar bottom badge */}
          <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <CyberDot color="var(--emerald)" />
              <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:"'JetBrains Mono', monospace", letterSpacing:'.08em' }}>
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </aside>

        {/* ═══════════════════ MAIN ═══════════════════ */}
        <main style={{ flex:1, overflowY:'auto', padding:'48px 52px', maxWidth:800 }}>

          {/* Page header */}
          <div style={{ marginBottom:44 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6, marginBottom:16,
              padding:'4px 12px', borderRadius:99,
              background:'rgba(124,77,255,0.08)', border:'1px solid rgba(124,77,255,0.18)',
            }}>
              <Zap size={10} color="var(--accent)" />
              <span style={{ fontSize:10, color:'var(--accent)', letterSpacing:'.12em', fontWeight:600, textTransform:'uppercase', fontFamily:"'JetBrains Mono', monospace" }}>
                Powered by AI
              </span>
            </div>
            <h1 style={{
              margin:'0 0 8px', fontSize:42, fontWeight:800, letterSpacing:'-.02em',
              color:'var(--text-1)', lineHeight:1.1,
            }}>
              Speech{' '}
              <span style={{
                background:'linear-gradient(90deg, var(--accent), var(--accent-2))',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>
                to Text
              </span>
            </h1>
            <p style={{ margin:0, fontSize:13, color:'var(--text-3)', letterSpacing:'.02em' }}>
              Transform voice into precise, editable text — instantly.
            </p>
          </div>

          {/* ─── RECORD CARD ─── */}
          <div style={{
            position:'relative', borderRadius:20, marginBottom:12, overflow:'hidden',
            background: isRecording
              ? 'linear-gradient(135deg, rgba(255,68,102,0.06) 0%, rgba(255,77,166,0.04) 100%)'
              : 'var(--bg-card)',
            border: isRecording ? '1px solid rgba(255,68,102,0.3)' : '1px solid var(--border)',
            backdropFilter:'blur(16px)',
            transition:'all .3s ease',
            boxShadow: isRecording ? '0 0 40px rgba(255,68,102,0.1), inset 0 1px 0 rgba(255,68,102,0.15)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <GlowLine color={isRecording ? 'var(--red)' : 'var(--accent)'} opacity={isRecording ? 0.7 : 0.35} />

            <div style={{ padding:'28px 32px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:24 }}>

                {/* ── Mic button ── */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  {/* Pulse rings */}
                  {isRecording && <>
                    <div style={{
                      position:'absolute', inset:0, borderRadius:20,
                      background:'var(--red)', opacity:.3,
                      animation:'pulse-ring 1.6s ease-out infinite',
                    }} />
                    <div style={{
                      position:'absolute', inset:0, borderRadius:20,
                      background:'var(--red)', opacity:.2,
                      animation:'pulse-ring2 1.6s ease-out infinite',
                      animationDelay:'.4s',
                    }} />
                  </>}

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
                    style={{
                      position:'relative', zIndex:1,
                      width:72, height:72, borderRadius:20,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      border:'none', outline:'none',
                      background: isRecording
                        ? 'linear-gradient(135deg, #ff2244, #ff4da6)'
                        : 'linear-gradient(135deg, var(--accent), #5b2de8)',
                      boxShadow: isRecording
                        ? '0 4px 24px rgba(255,34,68,0.45), 0 0 0 1px rgba(255,34,68,0.3)'
                        : '0 4px 24px var(--glow-v), 0 0 0 1px rgba(124,77,255,0.25)',
                      transition:'all .2s ease',
                      opacity: loading ? .4 : 1,
                    }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  >
                    {isRecording
                      ? <Square size={22} color="#fff" fill="#fff" />
                      : <Mic size={24} color="#fff" />
                    }
                  </button>
                </div>

                {/* Label + waveform */}
                <div style={{ flex:1, minWidth:0 }}>
                  <h2 style={{ margin:'0 0 4px', fontSize:16, fontWeight:700, color:'var(--text-1)', letterSpacing:'-.01em' }}>
                    {isRecording ? 'Recording in progress…' : 'Record Voice'}
                  </h2>
                  <p style={{ margin:0, fontSize:12, color:'var(--text-3)' }}>
                    {isRecording ? "Click stop when you're finished speaking" : 'Click the button and start speaking'}
                  </p>
                  {isRecording && <WaveformBars />}
                </div>

                {/* Status chip */}
                <div style={{
                  display:'flex', alignItems:'center', gap:6, padding:'6px 14px',
                  borderRadius:99, flexShrink:0,
                  background: isRecording ? 'rgba(255,68,102,0.1)' : 'rgba(255,255,255,0.04)',
                  border: isRecording ? '1px solid rgba(255,68,102,0.25)' : '1px solid var(--border)',
                }}>
                  <CyberDot color={isRecording ? 'var(--red)' : 'var(--text-3)'} />
                  <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono', monospace",
                    color: isRecording ? 'var(--red)' : 'var(--text-3)' }}>
                    {isRecording ? 'LIVE' : 'READY'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── UPLOAD CARD ─── */}
          <div style={{
            position:'relative', borderRadius:20, marginBottom:28, overflow:'hidden',
            background:'var(--bg-card)', border:'1px solid var(--border)',
            backdropFilter:'blur(16px)',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
            transition:'border-color .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <GlowLine color="var(--accent-2)" opacity={0.25} />
            <div style={{ padding:'28px 32px', display:'flex', alignItems:'center', gap:24 }}>

              {/* Upload button */}
              <label style={{
                width:72, height:72, borderRadius:20, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center', cursor: loading ? 'not-allowed' : 'pointer',
                background:'rgba(61,155,255,0.08)', border:'1px solid rgba(61,155,255,0.2)',
                transition:'all .2s ease',
                opacity: loading ? .5 : 1,
              }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(61,155,255,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(61,155,255,0.08)')}
              >
                {loading
                  ? <Loader2 size={22} color="var(--accent-2)" style={{ animation:'spin-slow .8s linear infinite' }} />
                  : <Upload size={22} color="var(--accent-2)" />
                }
                <input type="file" accept="audio/*" style={{ display:'none' }} disabled={loading}
                  onChange={(e) => e.target.files[0] && uploadAudio(e.target.files[0], e.target.files[0].name)} />
              </label>

              <div style={{ flex:1, minWidth:0 }}>
                <h2 style={{ margin:'0 0 4px', fontSize:16, fontWeight:700, color:'var(--text-1)', letterSpacing:'-.01em' }}>
                  {loading ? 'Transcribing…' : 'Upload Audio File'}
                </h2>
                <p style={{ margin:0, fontSize:12, color:'var(--text-3)' }}>
                  {loading ? 'Processing your audio, please wait' : 'Supports MP3 · WAV · M4A · WEBM · OGG'}
                </p>
                {loading && (
                  <div style={{ marginTop:10, height:2, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden', width:200 }}>
                    <div style={{
                      height:'100%', borderRadius:99, width:'65%',
                      background:`linear-gradient(90deg, var(--accent), var(--accent-2))`,
                      boxShadow:'0 0 8px var(--accent)',
                      animation:'shimmer 1.8s ease-in-out infinite',
                      backgroundSize:'200% 100%',
                    }} />
                  </div>
                )}
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                <Activity size={12} color="var(--text-3)" />
                <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:"'JetBrains Mono', monospace", letterSpacing:'.08em' }}>
                  AUDIO INPUT
                </span>
              </div>
            </div>
          </div>

          {/* ─── TRANSCRIPTION RESULT ─── */}
          {(transcription || loading) && (
            <div style={{
              borderRadius:20, overflow:'hidden', border:'1px solid var(--border)',
              backdropFilter:'blur(20px)',
              background:'linear-gradient(135deg, rgba(124,77,255,0.04) 0%, rgba(61,155,255,0.03) 100%)',
              boxShadow:'0 0 60px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
              animation:'float-in .4s ease both',
              position:'relative',
            }}>
              {/* Holographic shimmer overlay */}
              <div style={{
                position:'absolute', inset:0, pointerEvents:'none', borderRadius:20,
                background:'linear-gradient(135deg, rgba(124,77,255,0.03) 0%, transparent 50%, rgba(61,155,255,0.03) 100%)',
                animation:'holo-flicker 8s ease-in-out infinite',
              }} />

              {/* Corner accents */}
              {['topLeft','topRight','bottomLeft','bottomRight'].map(c => (
                <div key={c} style={{
                  position:'absolute', width:12, height:12,
                  top:    c.includes('top')    ? 0 : 'auto',
                  bottom: c.includes('bottom') ? 0 : 'auto',
                  left:   c.includes('Left')   ? 0 : 'auto',
                  right:  c.includes('Right')  ? 0 : 'auto',
                  borderTop:    c.includes('top')    ? '1.5px solid var(--accent)' : 'none',
                  borderBottom: c.includes('bottom') ? '1.5px solid var(--accent)' : 'none',
                  borderLeft:   c.includes('Left')   ? '1.5px solid var(--accent)' : 'none',
                  borderRight:  c.includes('Right')  ? '1.5px solid var(--accent)' : 'none',
                  borderTopLeftRadius:     c==='topLeft'     ? 4 : 0,
                  borderTopRightRadius:    c==='topRight'    ? 4 : 0,
                  borderBottomLeftRadius:  c==='bottomLeft'  ? 4 : 0,
                  borderBottomRightRadius: c==='bottomRight' ? 4 : 0,
                  opacity:.6,
                }} />
              ))}

              {/* Header */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'16px 24px', borderBottom:'1px solid var(--border)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <CyberDot color="var(--emerald)" />
                  <span style={{ fontSize:11, fontWeight:600, color:'var(--text-2)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono', monospace" }}>
                    Transcription Output
                  </span>
                </div>
                {transcription && (
                  <button onClick={handleCopy} style={{
                    display:'flex', alignItems:'center', gap:6, cursor:'pointer',
                    padding:'6px 14px', borderRadius:8, border:'1px solid var(--border)',
                    background:'transparent', color:'var(--text-3)', fontSize:11, fontWeight:600,
                    transition:'all .2s ease', fontFamily:"'JetBrains Mono', monospace",
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(124,77,255,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(124,77,255,0.3)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = copied ? 'var(--emerald)' : 'var(--text-3)';
                    }}
                  >
                    {copied
                      ? <><CheckCheck size={12} color="var(--emerald)" /><span style={{ color:'var(--emerald)' }}>Copied!</span></>
                      : <><Copy size={12} /><span>Copy text</span></>
                    }
                  </button>
                )}
              </div>

              {/* Body */}
              <div style={{ padding:'24px 28px', minHeight:120 }}>
                {loading
                  ? <SkeletonLines />
                  : (
                    <p style={{
                      margin:0, fontSize:15, lineHeight:1.75, fontWeight:400,
                      color:'rgba(255,255,255,0.72)',
                      fontFamily:"'Syne', sans-serif",
                      letterSpacing:'.01em',
                      textShadow:'0 0 20px rgba(124,77,255,0.15)',
                    }}>
                      {transcription}
                    </p>
                  )
                }
              </div>

              {/* Footer */}
              {transcription && !loading && (
                <div style={{
                  padding:'10px 24px', borderTop:'1px solid var(--border)',
                  display:'flex', alignItems:'center', gap:20,
                }}>
                  {[
                    `${transcription.length} chars`,
                    `${transcription.trim().split(/\s+/).filter(Boolean).length} words`,
                  ].map(label => (
                    <span key={label} style={{ fontSize:10, color:'var(--text-3)', fontFamily:"'JetBrains Mono', monospace", letterSpacing:'.06em' }}>
                      {label}
                    </span>
                  ))}
                  <div style={{ flex:1 }} />
                  <span style={{ fontSize:9, color:'rgba(124,77,255,0.5)', letterSpacing:'.1em', fontFamily:"'JetBrains Mono', monospace" }}>
                    AI · PROCESSED
                  </span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
