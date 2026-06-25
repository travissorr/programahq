/// <reference types="vite/client" />

// Figma exports asset imports as `figma:asset/<filename>`. The custom Vite
// plugin in vite.config.ts rewrites these to files in src/assets/ at build
// time; this ambient declaration teaches TypeScript that they resolve to a
// URL string so `tsc --noEmit` (and editors) don't flag them.
declare module "figma:asset/*" {
  const src: string;
  export default src;
}
