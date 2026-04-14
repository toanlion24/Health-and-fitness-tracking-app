/**
 * Shared visual tokens for Phase 1 screens (aligned with existing grays + blue accent).
 */
export const appTheme = {
  colors: {
    bg: "#f1f5f9",
    surface: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
    textSoft: "#94a3b8",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    primary: "#2563eb",
    primaryPressed: "#1d4ed8",
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
