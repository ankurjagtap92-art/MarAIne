import type { Config } from "tailwindcss";

/**
 * Tailwind v4 note:
 * All design tokens (colors, fonts, shadows, radii, animations) now live in
 * `globals.css` under the `@theme { ... }` block — that's the v4-native way
 * to define tokens and it's what actually generates the utility classes
 * (bg-ocean-deep, font-mono, animate-float, etc).
 *
 * This file is kept only in case a future plugin or tool needs a JS config
 * present. If you add a Tailwind plugin, register it here.
 */
const config: Config = {
  plugins: [],
};

export default config;