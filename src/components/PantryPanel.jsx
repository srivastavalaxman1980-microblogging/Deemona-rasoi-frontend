import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { GROCERY_CATEGORIES } from "../lib/constants.js";
import { useLang } from "../lib/i18n.jsx";

export default function PantryPanel({ household }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ item: "", quantity: "", category: "Vegetables" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await api.listPantry(household.id);
        if (alive) setItems(list);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [household.id]);

  async function add() {
    const name = form.item.trim();
    if (!name) return;
    setAdding(true);
    setError("");
    try {
      const created = await api.addPantryItem(household.id, {
        item: name,
        quantity: form.quantity.trim(),
        category: form.category,
      });
      setItems((prev) => [...prev, created]);
      setForm({ item: "", quantity: "", category: form.category });
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  async function remove(id) {
    const snapshot = items;
    setItems((prev) => prev.filter((x) => x.id !== id)); // optimistic
    try {
      await api.deletePantryItem(id);
    } catch (e) {
      setItems(snapshot);
      setError(e.message);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter") add();
  };

  return (
    <>
      <div className="section-h">
        <h2>{t("pantry.title")}</h2>
        <span className="note">
          Anything here is subtracted from your grocery list when you build it.
        </span>
      </div>

      <div className="card setup" style={{ marginBottom: 18 }}>
        <div className="pantry-add">
          <input
            type="text"
            placeholder={t("pantry.itemPlaceholder")}
            value={form.item}
            onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}
            onKeyDown={onKeyDown}
            aria-label="Item name"
          />
          <input
            type="text"
            placeholder="Qty (e.g. 1 kg)"
            value={form.quantity}
            onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
            onKeyDown={onKeyDown}
            aria-label="Quantity"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            aria-label="Category"
          >
            {GROCERY_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={add} disabled={adding || !form.item.trim()}>
            {adding ? <span className="spin" /> : t("pantry.add")}
          </button>
        </div>
        {error && (
          <div className="err" style={{ marginTop: 14 }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card empty">
          <p>Loading your pantry…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card empty">
          <p>
            Your pantry is empty. Add staples you keep on hand — rice, atta, oil,
            spices — and Rasoi won't put them on your shopping list.
          </p>
        </div>
      ) : (
        <div className="gcats">
          {GROCERY_CATEGORIES.map((cat) => {
            const inCat = items.filter((x) => x.category === cat);
            if (!inCat.length) return null;
            return (
              <div key={cat} className="card gcat">
                <h4>{cat}</h4>
                {inCat.map((x) => (
                  <div key={x.id} className="gitem pantry-item">
                    <span>
                      {x.item} <span className="q">{x.quantity}</span>
                    </span>
                    <button
                      className="pantry-del"
                      onClick={() => remove(x.id)}
                      aria-label={"Remove " + x.item}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
