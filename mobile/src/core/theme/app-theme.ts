/**
 * Shared visual tokens — Phase 2 home/dashboard aligned with gui2.pen (orange accent, soft gray canvas).
 */
export const appTheme = {
  colors: {
    bg: "#fafafa",
    surface: "#ffffff",
    surfaceMuted: "#f3f3f4",
    text: "#111214",
    textMuted: "#64748b",
    textSoft: "#94a3b8",
    border: "#e8e8e8",
    borderStrong: "#cbd5e1",
    primary: "#2563eb",
    primaryPressed: "#1d4ed8",
    accent: "#f97316",
    accentSoft: "#ff9c58",
    danger: "#b91c1c",
    success: "#15803d",
  },
  space: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadow: {
    card: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
  },
} as const;
