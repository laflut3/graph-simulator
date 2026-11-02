# Graph Simulator

A browser-based tool for creating and exploring simple undirected graphs. Add named vertices and edges, inspect connected components and simple cycles, compare graph representations, and import or export JSON. Graphs are saved in browser storage; no account, database, or application backend is used.

## Features

- Vertices can use letters, words, or short labels.
- View vertex degree, connected components, simple cycles, and selected-vertex details.
- Compare neighbor lists, adjacency matrices, and edge lists.
- Animate each representation's construction or debug it instruction by instruction. The trace shows loop checks, condition branches, and returns to loops.
- Import and export JSON configurations.
- Light, dark, and system themes.
- Installable PWA with an offline app shell.
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

Regenerate TanStack routes after changing route files, then build the site:

```bash
pnpm generate-routes
pnpm build
```

## JSON format

```json
{
  "nom": "test",
  "sommets": ["A", "B", "C"],
  "aretes": [["A", "B"], ["A", "C"]]
}
```

Edges must connect existing vertices. Self-loops and duplicate edges are rejected.

## SEO and deployment

The production domain is `graph.fleothing.com`, hosted on Vercel. The build script creates localized HTML entry pages for the English and French routes, with route-specific titles, descriptions, canonical URLs, and `hreflang` links. The simulator is marked `noindex`. `public/sitemap.xml` lists the public home, documentation, and legal pages; `public/robots.txt` points crawlers to the sitemap, and `public/llms.txt` summarizes the site.

To submit the site to Google, verify `graph.fleothing.com` as a Domain property in [Google Search Console](https://search.google.com/search-console) using the DNS TXT record Google provides. Then submit `https://graph.fleothing.com/sitemap.xml` under **Sitemaps**. Submission helps Google discover pages but does not guarantee indexing.

## Project checks

```bash
pnpm exec tsc --noEmit
pnpm build
```
