# Changelog

## [1.0.2] - 2026-10-26

### Fixed
- **Production build stability**: replaced `React.lazy` / `Suspense` with static imports for all pages in `App.tsx`. Lazy loading caused Rollup to inline `AuthContext` / `LanguageContext` into every page chunk, producing duplicate `createContext()` instances and throwing `"useAuth must be used within an AuthProvider"` (reproducible under VPN/proxy and with stale chunks).
- **Extension/proxy tolerance**: added `Node.prototype.removeChild` patch in `frontend/src/main.tsx` to ignore DOM mutations performed by browser extensions, translators, and VPN proxies, preventing `"Failed to execute 'removeChild' on 'Node'"` errors.
- **Google Translate protection**: added `<meta name="google" content="notranslate" />` to `frontend/index.html`.

### Changed
- **Vite configuration hardening** (`frontend/vite.config.ts`): `resolve.alias` pins a single copy of `react` / `react-dom`; `dedupe` includes `react`, `react-dom`, `react-router-dom`; `optimizeDeps.include` pre-bundles the core runtime; proxy timeouts set to 120000 ms (`timeout` / `proxyTimeout`).
- **Vercel caching headers** (`frontend/vercel.json`): `index.html` is served with `no-cache, no-store, must-revalidate`; `/assets/*` is served with `public, max-age=31536000, immutable`. Ensures atomic deploys and eliminates stale-chunk errors after new releases.
- **`LoadingSpinner`** is no longer used as a route-level `Suspense` fallback (the component remains available for other use cases).

## [1.0.0] - 2026-08-29

### Added
- Full CRUD for tickets
- Filtering, sorting, and searching
- Detailed page with status history and notes
- Analytical dashboard with charts (Recharts)
- Authentication (JWT)
- Internationalization (6 languages)
- Drag-and-drop import/export with path selection
- DDoS protection, request limits
- Backend wake-up mechanism (Cron-Job.org + frontend wait)
- Responsive design
- Dark/light theme (removed in v0.9.60)