import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";

// Build metadata shown in Admin > System. The commit is optional: hosted builds may not have git.
const gitCommit = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
})();

// Long-lived vendor chunks: they change far less often than the app code and word data, so repeat
// visitors keep them cached across deploys, and the browser fetches them in parallel (Vite adds
// <link rel="modulepreload"> for each). Only modules the entry already loads eagerly are grouped,
// so a library used only by a lazy page (Admin, Analytics, charts) stays in that page's chunk.
const VENDOR_GROUPS: [string, RegExp][] = [
  ["vendor-react", /\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run\/router)\//],
  ["vendor-supabase", /\/node_modules\/@supabase\//],
  ["vendor-radix", /\/node_modules\/(@radix-ui|@floating-ui|react-remove-scroll|react-remove-scroll-bar|react-style-singleton|use-callback-ref|use-sidecar|aria-hidden|get-nonce)\//],
];

type ModuleInfoLike = { isEntry: boolean; importers: readonly string[] } | null;
const eagerCache = new Map<string, boolean>();
// True when the module is reachable from the entry through static imports only.
function isEager(id: string, getModuleInfo: (id: string) => ModuleInfoLike): boolean {
  const cached = eagerCache.get(id);
  if (cached !== undefined) return cached;
  const seen = new Set<string>();
  const walk = (m: string): boolean => {
    if (eagerCache.get(m) === true) return true;
    if (seen.has(m)) return false;
    seen.add(m);
    const info = getModuleInfo(m);
    return !!info && (info.isEntry || info.importers.some(walk));
  };
  const eager = walk(id);
  eagerCache.set(id, eager);
  return eager;
}

function vendorChunks(id: string, { getModuleInfo }: { getModuleInfo: (id: string) => ModuleInfoLike }) {
  if (!id.includes("/node_modules/")) return undefined;
  const group = VENDOR_GROUPS.find(([, re]) => re.test(id));
  if (!group) return undefined;
  return isEager(id, getModuleInfo) ? group[0] : undefined;
}

// Preload the UI face (Plus Jakarta Sans) and the Quranic headword face (Amiri Quran): both paint above the
// fold, and preloading lets it arrive with the CSS instead of after layout, so the swap from the
// fallback font happens early or not at all. Prerendered pages inherit this from dist/index.html.
function preloadArabicFont(): Plugin {
  return {
    name: "preload-arabic-font",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        // Latin UI text and the Quranic headword face paint above the fold on most pages.
        const wanted = [/plus-jakarta-sans-latin-wght-normal.*\.woff2$/, /amiri-quran-arabic-400-normal.*\.woff2$/];
        const assets = Object.values(ctx.bundle ?? {}).filter((f) => f.type === "asset");
        return wanted
          .map((re) => assets.find((f) => re.test(f.fileName)))
          .filter((f): f is NonNullable<typeof f> => Boolean(f))
          .map((font) => ({
            tag: "link",
            attrs: { rel: "preload", href: `/${font.fileName}`, as: "font", type: "font/woff2", crossorigin: "" },
            injectTo: "head" as const,
          }));
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_COMMIT__: JSON.stringify(gitCommit),
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunks,
      },
    },
  },
  plugins: [
    react(),
    preloadArabicFont(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
