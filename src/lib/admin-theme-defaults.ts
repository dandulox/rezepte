/** Standard-Akzente Admin (Hell/Dunkel), synchron mit Prisma-Defaults. */
export type AdminThemeColors = {
  adminAccentLight: string;
  adminAccentLightHover: string;
  adminAccentLightFg: string;
  adminSuccessLight: string;
  adminAccentDark: string;
  adminAccentDarkHover: string;
  adminAccentDarkFg: string;
  adminSuccessDark: string;
};

export const ADMIN_THEME_DEFAULTS: AdminThemeColors = {
  adminAccentLight: "#4f46e5",
  adminAccentLightHover: "#4338ca",
  adminAccentLightFg: "#fafafa",
  adminSuccessLight: "#4338ca",
  adminAccentDark: "#818cf8",
  adminAccentDarkHover: "#a5b4fc",
  adminAccentDarkFg: "#18181b",
  adminSuccessDark: "#a5b4fc",
};
