export const DIETS = ["Veg", "Non-veg", "Vegan", "Jain", "Satvik"];

// Grouped so the dropdown stays readable. Backend stores region as free text,
// so this list is purely presentational and can grow freely.
export const REGION_GROUPS = [
  {
    label: "North & West India",
    options: [
      "North Indian",
      "Punjabi",
      "Rajasthani",
      "Himachali",
      "Kashmiri",
      "Awadhi (UP)",
    ],
  },
  {
    label: "East & North-East India",
    options: [
      "Bihari",
      "Jharkhandi",
      "Bengali",
      "Odia",
      "Assamese",
      "North Eastern",
    ],
  },
  {
    label: "West & Central India",
    options: ["Gujarati", "Maharashtrian", "Goan", "Malvani"],
  },
  {
    label: "South India",
    options: [
      "South Indian",
      "Tamil",
      "Andhra / Telugu",
      "Kerala",
      "Karnataka / Udupi",
      "Hyderabadi",
    ],
  },
  {
    label: "Pan-India",
    options: ["Mixed / Pan-India"],
  },
  {
    label: "International",
    options: [
      "Indo-Chinese",
      "Chinese",
      "Thai",
      "Japanese",
      "Korean",
      "Continental",
      "Italian",
      "Mexican",
      "Mediterranean",
      "Middle Eastern",
    ],
  },
];

// Flat list of every region value (used for validation / defaults if needed).
export const REGIONS = REGION_GROUPS.flatMap((g) => g.options);

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
