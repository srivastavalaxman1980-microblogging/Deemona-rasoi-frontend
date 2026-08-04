import { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";

const GREETING =
  "Hi! I'm your Rasoi kitchen assistant. Ask me what to cook, ingredient swaps, your grocery spend, or how to make any dish.";

const SR =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;
const TTS = typeof window !== "undefined" ? window.speechSynthesis : null;

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
    </svg>
  );
}

export default function VoiceAssistant({ householdId, planId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: GREETING, greeting: true },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speak, setSpeak] = useState(true);
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!SR) return;
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript || "";
      if (t) send(t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    return () => {
      try {
        r.abort();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  function speakText(text) {
    if (!speak || !TTS) return;
    try {
      TTS.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-IN";
      TTS.speak(u);
    } catch {}
  }

  function startListening() {
    if (!recRef.current || listening) return;
    try {
      TTS?.cancel();
      setListening(true);
      recRef.current.start();
    } catch {
      setListening(false);
    }
  }
  function stopListening() {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
  }

  async function send(text) {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    setInput("");
    const nextMessages = [...messages, { role: "user", content: msg }];
    setMessages(nextMessages);
    setThinking(true);
    try {
      const history = nextMessages
        .filter((m) => !m.greeting)
        .slice(-6)
        .map(({ role, content }) => ({ role, content }));
      const body = { message: msg, history };
      if (householdId) body.householdId = householdId;
      if (planId) body.planId = planId;
      const { reply } = await api.assistant(body);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      speakText(reply);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't reach the kitchen just now. Please try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      {!open && (
        <button className="va-fab" onClick={() => setOpen(true)} aria-label="Open Rasoi assistant">
          <MicIcon />
          <span>Ask Rasoi</span>
        </button>
      )}

      {open && (
        <div className="va-panel" role="dialog" aria-label="Rasoi assistant">
          <div className="va-head">
            <div className="va-title">Rasoi Assistant</div>
            <div className="va-head-actions">
              {TTS && (
                <button
                  className="va-icon"
                  onClick={() =>
                    setSpeak((s) => {
                      if (s) TTS.cancel();
                      return !s;
                    })
                  }
                  title={speak ? "Mute voice" : "Unmute voice"}
                  aria-label="Toggle voice"
                >
                  {speak ? <SpeakerIcon /> : <MuteIcon />}
                </button>
              )}
              <button
                className="va-icon va-close"
                onClick={() => {
                  TTS?.cancel();
                  setOpen(false);
                }}
                aria-label="Close assistant"
              >
                &times;
              </button>
            </div>
          </div>

          <div className="va-msgs" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={"va-msg " + m.role}>
                {m.content}
              </div>
            ))}
            {thinking && (
              <div className="va-msg assistant va-typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className="va-input">
            {SR && (
              <button
                className={"va-mic" + (listening ? " on" : "")}
                onClick={listening ? stopListening : startListening}
                title={listening ? "Stop" : "Speak"}
                aria-label={listening ? "Stop listening" : "Start speaking"}
              >
                <MicIcon />
              </button>
            )}
            <input
              type="text"
              placeholder={listening ? "Listening…" : "Ask or type…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button
              className="va-send"
              onClick={() => send()}
              disabled={thinking || !input.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>

          {!SR && (
            <div className="va-note">Voice input needs Chrome or Edge — you can type on any browser.</div>
          )}
        </div>
      )}
    </>
  );
}
