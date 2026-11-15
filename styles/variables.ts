// "Coach's clipboard": paper-white ink on a near-black board, graphite sheets for plans, safety
// orange for the one thing to do next, and pencil marks (red, amber) reserved for safety flags.
// Every text colour here passes WCAG AA on every surface below.
export const Colors = {
  lightGray: "#F2EEE8", // paper white: body text on dark surfaces
  midGray: "#A8A29A", // muted warm gray: secondary text, AA on all surfaces
  darkGray: "#57534E", // borders and hairlines only, never text
  richBlack: "#0F0F10", // page background
  midnight: "#0A0A0B", // navigation, deepest background
  surface: "#1B1A19", // sheets: plan cards, panels

  brand: {
    accent: "#FF6B2B", // primary actions; always with ink text, never white
    accentHover: "#FF8547",
    accentLight: "#FF9F70", // links and accents on dark, AA as text
    white: "#FFFFFF",
    muted: "#A8A29A",
    surface: "#1B1A19",
  },

  ink: "#0F0F10", // text on accent
  rule: "rgba(242, 238, 232, 0.09)", // ruled lines on sheets
  flag: {
    block: "#FF8A7A", // red pencil: blocks approval
    warn: "#F2C14E", // highlighter: worth a look
    ok: "#86D9A0", // approved, delivered
  },
};

export const Padding = {
  small: "4px",
  medium: "8px",
  large: "16px",
  xlarge: "32px",
  xxlarge: "48px",
  xxxlarge: "64px",
};

export const FontSize = {
  small: "12px",
  medium: "16px",
  large: "24px",
  xlarge: "32px",
  xxlarge: "64px",
};

export const FontFamily = {
  display: '"Barlow Condensed", "Arial Narrow", system-ui, sans-serif',
  primary: '"Inter Variable", system-ui, -apple-system, sans-serif',
  secondary: '"Inter Variable", system-ui, -apple-system, sans-serif',
};

export const FontWeight = {
  light: "300",
  regular: "400",
  semibold: "600",
  bold: "700",
};

export const BorderRadius = {
  small: "4px",
  medium: "8px",
  large: "16px",
  xlarge: "32px",
  xxlarge: "64px",
};

export const BorderWidth = {
  small: "1px",
  medium: "2px",
  large: "4px",
  xlarge: "8px",
  xxlarge: "16px",
};

export const Opacity = {
  small: "0.25",
  medium: "0.5",
  large: "0.75",
  xlarge: "0.9",
  xxlarge: "1",
};

export const MediaQueries = {
  SM: "(min-width: 360px)",
  MD: "(min-width: 768px)",
  LG: "(min-width: 992px)",
  XL: "(min-width: 1200px)",
};
