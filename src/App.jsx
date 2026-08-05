import { useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken } from "./api/client.js";
import { computeStats } from "./lib/nutrition.js";
import Header from "./components/Header.jsx";
import SetupForm from "./components/SetupForm.jsx";
import SummaryBar from "./components/SummaryBar.jsx";
import StatsRow from "./components/StatsRow.jsx";
import WeekGrid from "./components/WeekGrid.jsx";
import GroceryList from "./components/GroceryList.jsx";
import PantryPanel from "./components/PantryPanel.jsx";
import RecipeView from "./components/RecipeView.jsx";
import VoiceAssistant from "./components/VoiceAssistant.jsx";
import AuthPage from "./components/AuthPage.jsx";
import { useLang } from "./lib/i18n.jsx";

export default function App() {
  // Recipe pages open in a new tab as ?recipe=<mealId>.
  const recipeMealId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("recipe")
      : null;
  if (recipeMealId) return <RecipeView mealId={recipeMealId} />;

  const { t } = useLang();
  const [apiUp, setApiUp] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [household, setHousehold] = useState(null);
  const [plan, setPlan] = useState(null);
  const [grocery, setGrocery] = useState(null);
  const [phase, setPhase] = useState("setup");
  const [lastOpts, setLastOpts] = useState({ occasion: "Regular week", span: "week" });
  const [tab, setTab] = useState("planner");

  const [genBusy, setGenBusy] = useState(false);
  const [groceryBusy, setGroceryBusy] = useState(false);
  const [swappingId, setSwappingId] = useState(null);
  const [error, setError] = useState("");

  // Restore the signed-in user's most recent household + plan from the server.
  async function bootstrap() {
    try {
      const households = await api.listHouseholds();
      if (households && households.length) {
        const hh = households[0];
        setHousehold(hh);
        const plans = await api.listPlans(hh.id);
        if (plans && plans.length) {
          const full = await api.getPlan(plans[0].id);
          setPlan(full);
          setGrocery(full.grocery || null);
          setLastOpts({ occasion: full.occasion || "Regular week", span: full.span || "week" });
          setPhase("planner");
        }
      }
    } catch {
      /* first-time user or transient error; start fresh */
    }
  }

  // On load: check API health, then validate any saved login token.
  useEffect(() => {
    (async () => {
      try {
        await api.health();
        setApiUp(true);
      } catch {
        setApiUp(false);
        setAuthReady(true);
        return;
      }
      if (getToken()) {
        try {
          const u = await api.me();
          setUser(u);
          await bootstrap();
        } catch {
          clearToken();
        }
      }
      setAuthReady(true);
    })();
  }, []);

  const householdSize = plan
    ? (plan.constraints?.adults || 0) + (plan.constraints?.kids || 0)
    : 0;
  const stats = useMemo(() => computeStats(plan), [plan]);

  async function handleAuth(u) {
    setUser(u);
    await bootstrap();
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setHousehold(null);
    setPlan(null);
    setGrocery(null);
    setPhase("setup");
    setTab("planner");
  }

  async function handleGenerate(form, opts) {
    setError("");
    setGenBusy(true);
    try {
      let hh = household;
      hh = hh ? await api.updateHousehold(hh.id, form) : await api.createHousehold(form);
      setHousehold(hh);
      const full = await api.generatePlan(hh.id, {
        span: opts.span,
        occasion: opts.occasion,
        startDate: opts.startDate,
      });
      setPlan(full);
      setGrocery(full.grocery || null);
      setLastOpts(opts);
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
      setGrocery(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSwappingId(null);
    }
  }

  // ---- gating ----
  if (!authReady) {
    return (
      <div className="wrap">
        <div className="card empty" style={{ marginTop: 60 }}>
          <p>Loading…</p>
        </div>
      </div>
    );
  }
  if (!user) return <AuthPage onAuth={handleAuth} />;

  const showSetup = phase === "setup" || !plan;

  return (
    <div className="wrap">
      <Header user={user} onLogout={handleLogout} />

      {apiUp === false && (
        <div className="banner">
          Can't reach the backend at <code>{api.base}</code>. Start it with{" "}
          <code>npm run dev</code> in the API project, then reload this page.
        </div>
      )}

      {household && (
        <div className="nav">
          <button className={tab === "planner" ? "on" : ""} onClick={() => setTab("planner")}>
            {t("nav.planner")}
          </button>
          <button className={tab === "pantry" ? "on" : ""} onClick={() => setTab("pantry")}>
            {t("nav.pantry")}
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
        <br />
        Dish photos via{" "}
        <a href="https://www.pexels.com" target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>
          Pexels
        </a>
      </div>

      <VoiceAssistant householdId={household?.id} planId={plan?.id} />
    </div>
  );
}
