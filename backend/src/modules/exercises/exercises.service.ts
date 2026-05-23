import type {
  WgerExerciseCategoryDto,
  WgerExerciseDto,
  ListExercisesQuery,
} from "./exercises.dto.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const WGER_BASE = "https://wger.de/api/v2";
const USER_AGENT = "StudentHealthTrackingApp/1.0 (pogasdace2005@gmail.com)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function wgerGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) {
    throw new Error(`Wger API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Categories ───────────────────────────────────────────────────────────────

// TODO: Cache categories in-memory since they rarely change.
// Consider adding a TTL-based cache (e.g., 24 hours) if network latency
// becomes an issue in production.

export async function fetchExerciseCategories(): Promise<WgerExerciseCategoryDto[]> {
  const data = await wgerGet<{ results: { id: number; name: string }[] }>(
    `${WGER_BASE}/exercisecategory/?format=json`,
  );
  return data.results.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));
}

// ─── Exercises ────────────────────────────────────────────────────────────────

type WgerExerciseInfoResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
};

export async function fetchExercises(
  query: ListExercisesQuery,
): Promise<{ items: WgerExerciseDto[]; total: number; page: number; limit: number }> {
  const { category, page, limit, language } = query;

  // Wger uses 'offset' & 'limit' for pagination
  const offset = (page - 1) * limit;

  const url = new URL(`${WGER_BASE}/exerciseinfo/`);
  url.searchParams.set("format", "json");
  url.searchParams.set("language", String(language));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  if (category != null) {
    url.searchParams.set("category", String(category));
  }

  const data = await wgerGet<WgerExerciseInfoResponse>(url.toString());

  const items: WgerExerciseDto[] = data.results.map((ex: any) => {
    // The exerciseinfo endpoint provides translations and nested objects
    const name =
      ex.translations?.find((t: any) => t.language === language)?.name ||
      ex.name ||
      "Unknown exercise";
    const description =
      ex.translations?.find((t: any) => t.language === language)?.description ||
      ex.description ||
      "";

    return {
      id: ex.id,
      name,
      description: description.replace(/<[^>]*>/g, ""), // Strip HTML tags
      category: ex.category
        ? { id: ex.category.id, name: ex.category.name }
        : { id: 0, name: "Unknown" },
      muscles: (ex.muscles ?? []).map((m: any) => ({
        id: m.id,
        name: m.name,
        name_en: m.name_en || m.name,
      })),
      muscles_secondary: (ex.muscles_secondary ?? []).map((m: any) => ({
        id: m.id,
        name: m.name,
        name_en: m.name_en || m.name,
      })),
      equipment: (ex.equipment ?? []).map((e: any) => ({
        id: e.id,
        name: e.name,
      })),
      images: (ex.images ?? []).map((img: any) => ({
        id: img.id,
        image: img.image,
        is_main: img.is_main,
      })),
    };
  });

  return {
    items,
    total: data.count,
    page,
    limit,
  };
}
