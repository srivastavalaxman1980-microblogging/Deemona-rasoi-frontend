export const DIETS = ["Veg", "Non-veg", "Vegan", "Jain", "Satvik"];

export const REGIONS = [
  "North Indian",
  "South Indian",
  "Bengali",
  "Gujarati",
  "Maharashtrian",
  "Punjabi",
  "Mixed / Pan-India",
];

export const TIMES = [20, 30, 45, 60];

export const GOALS = [
  "Balanced",
  "Weight loss",
  "Muscle gain",
  "Diabetic-friendly",
  "Kids nutrition",
];

export const ALLERGENS = ["Peanut", "Dairy", "Gluten", "Soy", "Seafood", "Egg"];

export const OCCASIONS = [
  "Regular week",
  "Navratri fasting",
  "Festival feast",
  "Guests over",
];

export const GROCERY_CATEGORIES = [
  "Vegetables",
  "Grains & Flour",
  "Dairy & Eggs",
  "Protein",
  "Spices & Oil",
  "Other",
];

export const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack: "Snack",
  dinner: "Dinner",
};

// Region string can include a slash for display; backend stores it verbatim.
export const DEFAULT_HOUSEHOLD = {
  name: "My household",
  adults: 2,
  kids: 1,
  diet: "Veg",
  region: "North Indian",
  maxCookMin: 30,
  goal: "Balanced",
  dailyBudgetInr: 350,
  allergies: [],
};
