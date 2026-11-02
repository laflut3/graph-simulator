# Graph Simulator

A browser-based tool for creating and exploring directed or undirected graphs, with or without weights. Add named vertices and edges, inspect connected components and simple cycles, compare graph representations, and import or export JSON. Graphs are saved in browser storage; no account, database, or application backend is used.

## Features

- Vertices can use letters, words, or short labels.
- Choose directed or undirected edges and optionally attach numeric weights. Changing either graph type restores the sample graph after confirmation.
- View vertex degree, connected components, simple cycles, and selected-vertex details.
- Compare neighbor lists, adjacency matrices, and edge lists.
- Animate each representation's construction or debug it instruction by instruction. The trace shows loop checks, condition branches, and returns to loops; the active graph element and representation entry are highlighted in blue.
- Import and export JSON configurations.
- Light, dark, and system themes.
- Installable PWA with an offline app shell.
- Mobile layout keeps the graph in view, folds editing controls away until needed, and keeps PWA navigation reachable with device safe areas respected.
- English by default, with French available in the language menu.

## Routes

| Language | Home | Simulator | Documentation | Legal |
| --- | --- | --- | --- | --- |
| English | `/en-us/` | `/en-us/simulator` | `/en-us/docs` | `/en-us/legal` |
| French | `/fr-fr/` | `/fr-fr/simulator` | `/fr-fr/docs` | `/fr-fr/legal` |

## Development

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Graph analysis and editing live in `src/lib/graph`. Representation data, pseudocode, and each step-by-step builder are separated under `src/lib/graph/representation`; UI components display that data and handle interaction.

Regenerate TanStack routes after changing route files, then build the site:

```bash
pnpm generate-routes
pnpm build
```

## JSON format

```json
{
  "nom": "test",
  "oriente": false,
  "pondere": false,
  "sommets": ["A", "B", "C"],
  "aretes": [["A", "B"], ["A", "C"]]
}
```

If `oriente` or `pondere` is omitted, it defaults to `false`. For directed graphs, set `oriente` to `true`; reverse arcs are separate edges and self-loops such as `["A", "A"]` are allowed. For weighted graphs, set `pondere` to `true` and use three-item edge arrays such as `["A", "B", 2.5]`. Two-item edge arrays remain valid and receive a default weight of `1` when imported as weighted. Edges must connect existing vertices. Self-loops are rejected for undirected graphs, as are duplicate edges. Connected components in directed graphs are weak components, which ignore arc direction.

## SEO and deployment

The production domain is `graph.fleothing.com`, hosted on Vercel. The build script creates localized HTML entry pages for the English and French routes, with route-specific titles, descriptions, canonical URLs, and `hreflang` links. The simulator is marked `noindex`. `public/sitemap.xml` lists the public home, documentation, and legal pages; `public/robots.txt` points crawlers to the sitemap, and `public/llms.txt` summarizes the site.

To submit the site to Google, verify `graph.fleothing.com` as a Domain property in [Google Search Console](https://search.google.com/search-console) using the DNS TXT record Google provides. Then submit `https://graph.fleothing.com/sitemap.xml` under **Sitemaps**. Submission helps Google discover pages but does not guarantee indexing.

## Project checks

```bash
pnpm exec tsc --noEmit
pnpm build
```
