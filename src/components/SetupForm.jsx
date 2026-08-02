import { useState } from "react";
import {
  ALLERGENS,
  DEFAULT_HOUSEHOLD,
  DIETS,
  GOALS,
  OCCASIONS,
  REGIONS,
  TIMES,
} from "../lib/constants.js";

export default function SetupForm({ household, busy, error, onGenerate, onCancel }) {
  const initial = household || DEFAULT_HOUSEHOLD;
  const [form, setForm] = useState({
    name: initial.name,
    adults: initial.adults,
    kids: initial.kids,
    diet: initial.diet,
    region: initial.region,
    maxCookMin: initial.maxCookMin,
    goal: initial.goal,
    dailyBudgetInr: initial.dailyBudgetInr,
    allergies: initial.allergies || [],
  });
  const [occasion, setOccasion] = useState("Regular week");
  const [span, setSpan] = useState("week");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleAllergy = (a) =>
    setForm((p) => ({
      ...p,
      allergies: p.allergies.includes(a)
        ? p.allergies.filter((x) => x !== a)
        : [...p.allergies, a],
    }));

  const proteinTarget =
    form.adults * (form.goal === "Muscle gain" ? 68 : 55) + form.kids * 32;

  const submit = () => onGenerate(form, { occasion, span });

  return (
    <div className="card setup">
      <div className="disp lede">
        Plan your family's <em>whole week</em> in one tap.
      </div>
      <div className="desc">
        Tell Rasoi about your household. It builds a balanced, no-repeat weekly
        menu &mdash; breakfast, lunch, snack and dinner &mdash; then turns it into a
        costed grocery list.
      </div>

      <div className="grid">
        <div className="field">
          <label>Household</label>
          <div className="steppers">
            <div className="stepper">
              <button onClick={() => set("adults", Math.max(1, form.adults - 1))} aria-label="Fewer adults">
                −
              </button>
              <span className="val">{form.adults}</span>
              <span className="lbl">adults</span>
              <button onClick={() => set("adults", Math.min(12, form.adults + 1))} aria-label="More adults">
                +
              </button>
            </div>
            <div className="stepper">
              <button onClick={() => set("kids", Math.max(0, form.kids - 1))} aria-label="Fewer kids">
                −
              </button>
              <span className="val">{form.kids}</span>
              <span className="lbl">kids</span>
              <button onClick={() => set("kids", Math.min(12, form.kids + 1))} aria-label="More kids">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="field">
          <label>
            Daily food budget <span className="hint">(₹)</span>
          </label>
          <input
            type="number"
            min="0"
            step="50"
            value={form.dailyBudgetInr}
            onChange={(e) => set("dailyBudgetInr", Number(e.target.value) || 0)}
          />
        </div>

        <div className="field">
          <label>Diet</label>
          <div className="chips">
            {DIETS.map((d) => (
              <button
                key={d}
                className={"chip" + (form.diet === d ? " on" : "")}
                onClick={() => set("diet", d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Cuisine style</label>
          <select value={form.region} onChange={(e) => set("region", e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Health goal</label>
          <select value={form.goal} onChange={(e) => set("goal", e.target.value)}>
            {GOALS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>
            Max cooking time <span className="hint">per meal</span>
          </label>
          <div className="chips">
            {TIMES.map((t) => (
              <button
                key={t}
                className={"chip" + (form.maxCookMin === t ? " on" : "")}
                onClick={() => set("maxCookMin", t)}
              >
                {t} min
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>
            This week <span className="hint">(context)</span>
          </label>
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            {OCCASIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Allergies to avoid</label>
          <div className="chips">
            {ALLERGENS.map((a) => (
              <button
                key={a}
                className={"chip warn" + (form.allergies.includes(a) ? " on" : "")}
                onClick={() => toggleAllergy(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Plan length</label>
          <div className="segmented" role="group" aria-label="Plan length">
            <button className={span === "week" ? "on" : ""} onClick={() => setSpan("week")}>
              1 week
            </button>
            <button className={span === "month" ? "on" : ""} onClick={() => setSpan("month")}>
              1 month
            </button>
          </div>
        </div>
      </div>

      <div className="cta">
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? (
            <>
              <span className="spin" />
              {span === "month" ? "Cooking up your month…" : "Cooking up your week…"}
            </>
          ) : (
            <>Generate {span === "month" ? "monthly" : "weekly"} plan</>
          )}
        </button>
        {household && onCancel && (
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Target ~{proteinTarget}g protein/day for the household
        </span>
      </div>

      {error && (
        <div className="err">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
