const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const USER_ID =
  import.meta.env.VITE_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": USER_ID,
        ...(options.headers || {}),
      },
    });
  } catch (networkErr) {
    throw new Error(`Can't reach the API at ${BASE}. Is the backend running?`);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  base: BASE,

  health: () => request("/health"),

  createHousehold: (body) =>
    request("/api/households", { method: "POST", body: JSON.stringify(body) }),
  getHousehold: (id) => request(`/api/households/${id}`),
  updateHousehold: (id, body) =>
    request(`/api/households/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  listPlans: (householdId) => request(`/api/households/${householdId}/meal-plans`),
  generatePlan: (householdId, body) =>
    request(`/api/households/${householdId}/meal-plans`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getPlan: (planId) => request(`/api/meal-plans/${planId}`),
  deletePlan: (planId) => request(`/api/meal-plans/${planId}`, { method: "DELETE" }),

  swapMeal: (mealId) => request(`/api/meals/${mealId}/swap`, { method: "POST" }),

  buildGrocery: (planId) =>
    request(`/api/meal-plans/${planId}/grocery`, { method: "POST" }),
  getGrocery: (planId) => request(`/api/meal-plans/${planId}/grocery`),

  listPantry: (householdId) => request(`/api/households/${householdId}/pantry`),
  addPantryItem: (householdId, body) =>
    request(`/api/households/${householdId}/pantry`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePantryItem: (id, body) =>
    request(`/api/pantry/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deletePantryItem: (id) => request(`/api/pantry/${id}`, { method: "DELETE" }),

  getDishImage: (name) => request(`/api/dish-image?name=${encodeURIComponent(name)}`),
  getRecipe: (mealId) => request(`/api/meals/${mealId}/recipe`),

  assistant: (body) =>
    request("/api/assistant", { method: "POST", body: JSON.stringify(body) }),
};
