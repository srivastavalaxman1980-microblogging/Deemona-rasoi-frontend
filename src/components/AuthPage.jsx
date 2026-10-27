import { useEffect, useRef, useState } from "react";
import { api, setToken } from "../api/client.js";
import { LANGUAGES, useLang } from "../lib/i18n.jsx";
import { LegalLinks } from "./LegalPage.jsx";
import { legalHref } from "../legal/config.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function AuthPage({ onAuth }) {
  const { t, lang, setLang } = useLang();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(""); // success / info message
  const [needsVerify, setNeedsVerify] = useState(false); // show "resend" link
  const googleBtnRef = useRef(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function finish(promise) {
    setError("");
    setNotice("");
    setNeedsVerify(false);
    setBusy(true);
    try {
      const result = await promise;
      if (result.needsVerification) {
        setNotice(`We sent a verification link to ${result.email}. Open it to activate your account, then sign in.`);
        setNeedsVerify(true);
        setMode("login");
        setBusy(false);
        return;
      }
      setToken(result.token);
      onAuth(result.user);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      if (e.code === "EMAIL_NOT_VERIFIED") setNeedsVerify(true);
      setBusy(false);
    }
  }

  async function sendSimple(fn, okMsg) {
    if (!form.email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await fn(form.email.trim());
      setNotice(okMsg);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  const forgot = () =>
    sendSimple(
      api.forgotPassword,
      "If an account exists for that email, we've sent a password reset link. It is valid for 1 hour."
    );
  const resend = () =>
    sendSimple(
      api.resendVerification,
      "If that account still needs verifying, we've sent a new link."
    );

  async function submit() {
    if (mode === "forgot") return forgot();
    if (!form.email.trim() || !form.password || (mode === "signup" && !form.name.trim())) {
      setError("Please fill in all fields.");
      return;
    }
    finish(
      mode === "signup"
        ? api.register({ name: form.name, email: form.email, password: form.password })
        : api.login({ email: form.email, password: form.password })
    );
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  // Render the Google Sign-In button once the GIS script is ready.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let tries = 0;
    const timer = setInterval(() => {
      const gid = window.google?.accounts?.id;
      if (gid) {
        clearInterval(timer);
        gid.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => {
            if (resp?.credential) finish(api.googleLogin(resp.credential));
          },
        });
        if (googleBtnRef.current) {
          gid.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: 360,
            text: "continue_with",
            shape: "pill",
          });
        }
      } else if (++tries > 50) {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-wrap">
      <div className="auth-lang">
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t("lang.label")}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native}
            </option>
          ))}
        </select>
      </div>

      <div className="auth-card card">
        <div className="auth-brand">
          <div className="logo" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 9a8 8 0 0116 0" stroke="#E39B2C" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 9h20M6 9v9a2 2 0 002 2h8a2 2 0 002-2V9" stroke="#163d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="disp auth-name">Deemona&nbsp;Rasoi</div>
            <div className="auth-sub">{t("auth.subtitle")}</div>
          </div>
        </div>

        <h2 className="disp auth-title">
          {mode === "signup" ? t("auth.signupTitle") : mode === "forgot" ? "Reset your password" : t("auth.loginTitle")}
        </h2>

        {mode === "forgot" && (
          <p className="auth-hint">Enter your account email and we'll send you a link to set a new password.</p>
        )}

        {GOOGLE_CLIENT_ID && mode !== "forgot" && (
          <>
            <div className="google-wrap" ref={googleBtnRef} />
            <div className="auth-or"><span>or</span></div>
          </>
        )}

        <div className="auth-fields">
          {mode === "signup" && (
            <div className="field">
              <label>{t("auth.name")}</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} onKeyDown={onKeyDown} autoComplete="name" />
            </div>
          )}
          <div className="field">
            <label>{t("auth.email")}</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} onKeyDown={onKeyDown} autoComplete="email" />
          </div>
          {mode !== "forgot" && (
          <div className="field">
            <label>{t("auth.password")}</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} onKeyDown={onKeyDown} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            {mode === "signup" && <div className="auth-hint">At least 8 characters, with a letter and a number.</div>}
          </div>
          )}
        </div>

        {notice && <div className="auth-notice">{notice}</div>}

        {error && (
          <div className="err" style={{ marginTop: 14 }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button className="btn btn-primary auth-submit" onClick={submit} disabled={busy}>
          {busy ? <span className="spin" /> : mode === "signup" ? t("auth.signupBtn") : mode === "forgot" ? "Send reset link" : t("auth.loginBtn")}
        </button>

        {mode === "login" && (
          <button className="auth-toggle" onClick={() => { setError(""); setNotice(""); setMode("forgot"); }}>
            Forgot password?
          </button>
        )}
        {needsVerify && mode === "login" && (
          <button className="auth-toggle" onClick={resend} disabled={busy}>
            Resend verification email
          </button>
        )}

        <p className="auth-consent">
          By continuing you agree to our{" "}
          <a href={legalHref("terms")} target="_blank" rel="noreferrer">Terms</a> and{" "}
          <a href={legalHref("privacy")} target="_blank" rel="noreferrer">Privacy Policy</a>.
        </p>

        <button
          className="auth-toggle"
          onClick={() => {
            setError("");
            setNotice("");
            setNeedsVerify(false);
            setMode(mode === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? t("auth.toSignup") : t("auth.toLogin")}
        </button>
      </div>

      <div className="foot" style={{ marginTop: 24 }}>
        <b>Deemona Rasoi</b> — powered by Claude
      </div>
      <LegalLinks />
    </div>
  );
}
