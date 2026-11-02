# Project instructions

- Keep the simulator, home page, and documentation direct and easy to use. Prefer small, consistent UI changes that work on mobile and in light, dark, and system themes.
- Keep the interface and in-app documentation available in English and French. Keep repository Markdown files in English only, and keep them consistent with actual routes and behavior.
- After each feature, review the affected pages for clear navigation, accessible controls, responsive layout, and visual consistency. Check all three theme choices when UI behavior or colors change.
- Keep cookie, privacy, and legal statements tied to behavior that exists in the code. Update those pages whenever storage, analytics, hosting, or data flows change. Do not claim legal compliance from a code review alone.
- Keep PWA manifest icons, service worker cache rules, offline documentation, and HTTPS deployment notes in sync. Verify the production build and offline app shell when these change.
- The graph is a simple, undirected graph. Keep imported JSON validation aligned with the graph model and document its exported format in both languages.
- Run `pnpm exec biome check`, `pnpm exec tsc --noEmit`, and `pnpm build` after implementation changes. Review `git diff --check` and the final diff before finishing.
- Do not add dependencies, commit, push, or deploy unless the user asks.
