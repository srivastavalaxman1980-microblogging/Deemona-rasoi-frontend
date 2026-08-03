export function computeStats(plan) {
  if (!plan?.days?.length) return null;

  let protein = 0;
  let kcal = 0;
  let mealCount = 0;
  let vegCount = 0;

  for (const day of plan.days) {
    for (const meal of day.meals) {
      protein += Number(meal.proteinG) || 0;
      kcal += Number(meal.kcal) || 0;
      mealCount += 1;
      if (meal.isVeg) vegCount += 1;
    }
  }

  const days = plan.numDays || plan.days.length;
  const target = plan.proteinTargetG || 1;
  const avgProteinDay = Math.round(protein / days);

  return {
    avgProteinDay,
    avgKcalPerson: Math.round(kcal / days),
    vegPct: mealCount ? Math.round((vegCount / mealCount) * 100) : 0,
    proteinPctOfTarget: Math.min(999, Math.round((avgProteinDay / target) * 100)),
    target,
  };
}

export function dayProtein(day) {
  return day.meals.reduce((sum, m) => sum + (Number(m.proteinG) || 0), 0);
}
