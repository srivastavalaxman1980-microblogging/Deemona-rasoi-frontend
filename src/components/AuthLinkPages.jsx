import { useEffect, useState } from "react";
import { api, setToken } from "../api/client.js";

function Shell({ title, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <div className="auth-brand">
          <div>
            <div className="disp auth-name">Deemona&nbsp;Rasoi</div>
          </div>
        </div>
        <h2 className="disp auth-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function goHome() {
  window.location.href = "/";
}

// Opened from the link in the verification email: /?verify=<token>
export function VerifyEmailPage({ token }) {
  const [state, setState] = useState("working"); // working | ok | error
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .verifyEmail(token)
      .then((r) => {
        if (!alive) return;
        setToken(r.token); // signs the user in
        setState("ok");
        setTimeout(goHome, 1500);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        setState("error");
      });
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <Shell title="Email verification">
      {state === "working" && <p>Verifying your email…</p>}
      {state === "ok" && <p>Email verified. Taking you to Rasoi…</p>}
      {state === "error" && (
        <>
          <div className="err"><span>⚠️</span><span>{error}</span></div>
          <button className="btn btn-primary auth-submit" onClick={goHome}>Back to sign in</button>
        </>
      )}
    </Shell>
  );
}

// Opened from the link in the reset email: /?reset=<token>
export function ResetPasswordPage({ token }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setError("");
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
      setError("Use at least 8 characters, with a letter and a number.");
      return;
    }
    if (pw !== pw2) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(token, pw);
      setDone(true);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Shell title="Password updated">
        <p>Your password has been changed. You can now sign in.</p>
        <button className="btn btn-primary auth-submit" onClick={goHome}>Go to sign in</button>
      </Shell>
    );
  }

  return (
    <Shell title="Choose a new password">
      <div className="auth-fields">
        <div className="field">
          <label>New password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="field">
          <label>Confirm password</label>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoComplete="new-password"
          />
        </div>
      </div>
      {error && (
        <div className="err" style={{ marginTop: 14 }}><span>⚠️</span><span>{error}</span></div>
      )}
      <button className="btn btn-primary auth-submit" onClick={submit} disabled={busy}>
        {busy ? <span className="spin" /> : "Update password"}
      </button>
    </Shell>
  );
}
