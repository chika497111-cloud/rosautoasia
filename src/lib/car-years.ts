import { carModels } from "./car-data";

/**
 * Returns an array of available years for a given model ID,
 * derived from the "years" range string in car-data (e.g. "2001-2024").
 * Returns last 6 years from the range for a cleaner UI.
 */
export function getYearsForModel(modelId: string): number[] {
  const model = carModels.find((m) => m.id === modelId);
  if (!model) return [];

  const [startStr, endStr] = model.years.split("-");
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);

  if (isNaN(start) || isNaN(end)) return [];

  const years: number[] = [];
  // Show last 6 years of the range (or all if range is shorter)
  const rangeStart = Math.max(start, end - 5);
  for (let y = end; y >= rangeStart; y--) {
    years.push(y);
  }

  return years;
}
