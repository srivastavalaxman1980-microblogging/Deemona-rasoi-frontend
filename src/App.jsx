import { useEffect, useMemo, useState } from "react";
import { api } from "./api/client.js";
import { computeStats } from "./lib/nutrition.js";
import Header from "./components/Header.jsx";
import SetupForm from "./components/SetupForm.jsx";
import SummaryBar from "./components/SummaryBar.jsx";
import StatsRow from "./components/StatsRow.jsx";
import WeekGrid from "./components/WeekGrid.jsx";
import GroceryList from "./components/GroceryList.jsx";
import PantryPanel from "./components/PantryPanel.jsx";

const LS_HOUSEHOLD = "rasoi.householdId";
const LS_PLAN = "rasoi.planId";

export default function App() {
  const [apiUp, setApiUp] = useState(null); // null = checking
  const [household, setHousehold] = useState(null);
  const [plan, setPlan] = useState(null);
  const [grocery, setGrocery] = useState(null);
  const [phase, setPhase] = useState("setup"); // "setup" | "planner"
  const [lastOpts, setLastOpts] = useState({ occasion: "Regular week", span: "week" });
  const [tab, setTab] = useState("planner"); // "planner" | "pantry"

  const [genBusy, setGenBusy] = useState(false);
  const [groceryBusy, setGroceryBusy] = useState(false);
  const [swappingId, setSwappingId] = useState(null);
  const [error, setError] = useState("");

  // On load: check API health, then restore any saved household + plan.
  useEffect(() => {
    (async () => {
      try {
        await api.health();
        setApiUp(true);
      } catch {
        setApiUp(false);
        return;
      }

      const hid = localStorage.getItem(LS_HOUSEHOLD);
      const pid = localStorage.getItem(LS_PLAN);
      if (hid) {
        try {
          setHousehold(await api.getHousehold(hid));
        } catch {
          localStorage.removeItem(LS_HOUSEHOLD);
        }
      }
      if (pid) {
        try {
          const full = await api.getPlan(pid);
          setPlan(full);
          setGrocery(full.grocery || null);
          setLastOpts({ occasion: full.occasion || "Regular week", span: full.span || "week" });
          setPhase("planner");
        } catch {
          localStorage.removeItem(LS_PLAN);
        }
      }
    })();
  }, []);

  const householdSize = plan
    ? (plan.constraints?.adults || 0) + (plan.constraints?.kids || 0)
    : 0;
  const stats = useMemo(() => computeStats(plan), [plan]);

  async function handleGenerate(form, opts) {
    setError("");
    setGenBusy(true);
    try {
      let hh = household;
      hh = hh ? await api.updateHousehold(hh.id, form) : await api.createHousehold(form);
      setHousehold(hh);
      localStorage.setItem(LS_HOUSEHOLD, hh.id);

      const full = await api.generatePlan(hh.id, {
        span: opts.span,
        occasion: opts.occasion,
      });
      setPlan(full);
      setGrocery(full.grocery || null);
      setLastOpts(opts);
      localStorage.setItem(LS_PLAN, full.id);
      setPhase("planner");
    } catch (e) {
      setError(e.message);
    } finally {
      setGenBusy(false);
    }
  }

  async function handleRegenerate() {
    if (!household) return;
    setError("");
    setGenBusy(true);
    try {
      const full = await api.generatePlan(household.id, lastOpts);
      setPlan(full);
      setGrocery(full.grocery || null);
      localStorage.setItem(LS_PLAN, full.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenBusy(false);
    }
  }

  async function handleBuildGrocery() {
    if (!plan) return;
    setError("");
    setGroceryBusy(true);
    try {
      setGrocery(await api.buildGrocery(plan.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setGroceryBusy(false);
    }
  }

  async function handleSwap(mealId) {
    setError("");
    setSwappingId(mealId);
    try {
      const updated = await api.swapMeal(mealId);
      setPlan((prev) => ({
        ...prev,
        days: prev.days.map((d) => ({
          ...d,
          meals: d.meals.map((m) =>
            m.id === updated.mealId
              ? {
                  ...m,
                  dish: updated.dish,
                  proteinG: updated.proteinG,
                  kcal: updated.kcal,
                  cookMin: updated.cookMin,
                  isVeg: updated.isVeg,
                }
              : m
          ),
        })),
      }));
      setGrocery(null); // grocery list is now stale
    } catch (e) {
      setError(e.message);
    } finally {
      setSwappingId(null);
    }
  }

  const showSetup = phase === "setup" || !plan;

  return (
    <div className="wrap">
      <Header />

      {apiUp === false && (
        <div className="banner">
          Can't reach the backend at <code>{api.base}</code>. Start it with{" "}
          <code>npm run dev</code> in the API project, then reload this page.
        </div>
      )}

      {household && (
        <div className="nav">
          <button className={tab === "planner" ? "on" : ""} onClick={() => setTab("planner")}>
            Planner
          </button>
          <button className={tab === "pantry" ? "on" : ""} onClick={() => setTab("pantry")}>
            Pantry
          </button>
        </div>
      )}

      {tab === "pantry" && household ? (
        <PantryPanel household={household} />
      ) : (
        <>
          {showSetup && (
            <SetupForm
              household={household}
              busy={genBusy}
              error={error}
              onGenerate={handleGenerate}
              onCancel={plan ? () => setPhase("planner") : null}
            />
          )}

          {plan && phase === "planner" && (
            <>
              <SummaryBar
                household={household}
                plan={plan}
                busy={genBusy}
                onEdit={() => setPhase("setup")}
                onRegenerate={handleRegenerate}
              />

              {error && (
                <div className="err" style={{ marginTop: 0, marginBottom: 16 }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <StatsRow stats={stats} grocery={grocery} spanLabel={plan.span} />

              <WeekGrid plan={plan} swappingId={swappingId} onSwap={handleSwap} />

              <GroceryList
                plan={plan}
                grocery={grocery}
                busy={groceryBusy}
                householdSize={householdSize}
                onBuild={handleBuildGrocery}
              />
            </>
          )}
        </>
      )}

      <div className="foot">
        <b>Deemona Rasoi</b> — meal planner · built for Indian households · powered by
        Claude
      </div>
    </div>
  );
}
