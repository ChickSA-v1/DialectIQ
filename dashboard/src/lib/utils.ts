export function sentimentColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 7) return "text-emerald-500";
  if (score >= 4) return "text-amber-500";
  return "text-red-500";
}

export function sentimentBg(score: number | null): string {
  if (score === null) return "bg-gray-100";
  if (score >= 7) return "bg-emerald-50 border-emerald-200";
  if (score >= 4) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function urgencyBadge(level: string | null): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (level) {
    case "High":
      return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
    case "Medium":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        dot: "bg-amber-500",
      };
    case "Low":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
  }
}

export function ratingStars(rating: number | null): string {
  if (rating === null) return "—";
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function formatDate(iso: string, locale: string = "en"): string {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Chart-friendly colors
export const CHART_COLORS = [
  "#00D2DF", // vibrant cyan
  "#FBBF24", // golden yellow
  "#10B981", // emerald green
  "#F43F5E", // coral red
  "#0B1B3D", // deep navy
  "#14b8a6", // teal
  "#f97316", // orange
  "#FBBF24", // lavender
];
