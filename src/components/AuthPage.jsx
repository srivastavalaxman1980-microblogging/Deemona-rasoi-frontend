import { useState } from "react";
import { api, setToken } from "../api/client.js";
import { LANGUAGES, useLang } from "../lib/i18n.jsx";

export default function AuthPage({ onAuth }) {
  const { t, lang, setLang } = useLang();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function submit() {
    setError("");
    if (!form.email.trim() || !form.password || (mode === "signup" && !form.name.trim())) {
      setError("Please fill in all fields.");
      return;
    }
    setBusy(true);
    try {
      const result =
        mode === "signup"
          ? await api.register({ name: form.name, email: form.email, password: form.password })
          : await api.login({ email: form.email, password: form.password });
      setToken(result.token);
      onAuth(result.user);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

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
          {mode === "signup" ? t("auth.signupTitle") : t("auth.loginTitle")}
        </h2>

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
          <div className="field">
            <label>{t("auth.password")}</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} onKeyDown={onKeyDown} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          </div>
        </div>

        {error && (
          <div className="err" style={{ marginTop: 14 }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button className="btn btn-primary auth-submit" onClick={submit} disabled={busy}>
          {busy ? <span className="spin" /> : mode === "signup" ? t("auth.signupBtn") : t("auth.loginBtn")}
        </button>

        <button
          className="auth-toggle"
          onClick={() => {
            setError("");
            setMode(mode === "signup" ? "login" : "signup");
          }}
        >
          {mode === "signup" ? t("auth.toLogin") : t("auth.toSignup")}
        </button>
      </div>

      <div className="foot" style={{ marginTop: 24 }}>
        <b>Deemona Rasoi</b> — powered by Claude
      </div>
    </div>
  );
}
