# Graph Simulator

## Français

Application web pour créer et étudier des graphes non orientés simples. La page d’accueil présente le projet ; le simulateur permet d’ajouter des sommets et des arêtes, d’inspecter les composantes connexes et les cycles, et d’importer ou télécharger une configuration JSON. La documentation intégrée est disponible en français et en anglais.

La navigation comprend l’accueil (`/`), le simulateur (`/simulator`), la documentation bilingue (`/docs`) et les informations légales (`/legal`). Le thème peut suivre le système ou être fixé en clair ou en sombre.

Le simulateur permet de nommer le graphe et d’examiner sa liste d’arêtes, ses listes de voisins ou sa matrice d’adjacence, dans un panneau à droite du dessin. Les listes de voisins sont sélectionnées par défaut. Le bouton de lecture de chaque représentation reconstruit le dessin, sommet par sommet puis arête par arête. La complexité affichée correspond à cette construction : Θ(|V| + |E|) pour les listes de voisins et la liste d’arêtes, Θ(|V|²) pour la matrice. Les autres algorithmes sont annoncés « Coming soon ».

Le site est installable comme PWA dans les navigateurs compatibles. Après chargement de l’application et de ses ressources, le service worker les garde en cache pour une ouverture hors ligne. En production, le site doit être servi sur HTTPS.

### SEO et GEO (référencement pour les moteurs de réponse générative)

Les pages publiques ont des titres, descriptions, URL canoniques et métadonnées de partage dédiés. Le build produit une page HTML initiale par route ; `vercel.json` les sert directement pour que les moteurs et les aperçus sociaux reçoivent les bonnes métadonnées sans attendre JavaScript. Le simulateur est marqué `noindex` car il s’agit d’un espace interactif. `public/robots.txt` autorise l’exploration et indique le sitemap ; `public/sitemap.xml` ne référence que l’accueil, la documentation et les informations légales. `public/llms.txt` donne un résumé textuel du projet et de ses pages aux outils qui choisissent de le lire. Les données JSON-LD décrivent le site, l’application et son auteur. Ces éléments aident les moteurs à comprendre le contenu, sans garantir l’indexation ni les citations dans des réponses génératives.

Après le déploiement Vercel du domaine `graph.fleothing.com` :

1. Vérifiez que `https://graph.fleothing.com/robots.txt`, `/sitemap.xml` et `/llms.txt` répondent publiquement, ainsi que les routes `/` et `/docs`.
2. Ajoutez `graph.fleothing.com` comme propriété de type Domaine dans [Google Search Console](https://search.google.com/search-console). Copiez l’enregistrement TXT fourni et ajoutez-le à la zone DNS qui fait autorité pour ce sous-domaine, puis lancez la vérification.
3. Dans Search Console, ouvrez **Sitemaps**, saisissez `sitemap.xml`, puis envoyez-le. Inspectez ensuite `/` et `/docs` avec l’outil d’inspection d’URL et demandez leur indexation.
4. Consultez les rapports d’indexation et de performances au fil du temps. L’envoi d’un sitemap est un signal de découverte, pas une garantie d’indexation immédiate.

Vérifiez également les métadonnées et les données structurées avec les outils Google avant et après la mise en ligne. Pour maintenir ces informations exactes, mettez à jour `src/lib/seo.ts`, `scripts/generate-seo-pages.mjs`, `index.html`, `vercel.json`, `public/sitemap.xml` et `public/llms.txt` lorsque le domaine, les routes ou la description du projet changent.

### Lancer le projet

```bash
pnpm install
pnpm dev
```

Ouvrez l’adresse indiquée dans le terminal.

### Format JSON

```json
{
  "nom": "test",
  "sommets": ["A", "B", "C"],
  "aretes": [["A", "B"], ["A", "C"]]
}
```

Chaque arête relie deux sommets existants. Les boucles et les arêtes en double sont refusées.

### Vérifications

```bash
pnpm exec biome check .
pnpm exec tsc --noEmit
pnpm build
```

## English

Web app for creating and studying simple undirected graphs. The home page introduces the project. The simulator lets you add vertices and edges, inspect connected components and cycles, and import or download a JSON configuration. In-app documentation is available in French and English.

Navigation includes the home page (`/`), simulator (`/simulator`), bilingual documentation (`/docs`), and legal information (`/legal`). The theme can follow the system or be set to light or dark.

The simulator lets you name a graph and inspect its edge list, neighbor lists, or adjacency matrix in a panel beside the drawing. Neighbor lists are selected by default. The play button for each representation rebuilds the drawing vertex by vertex, then edge by edge. The displayed complexity is for this construction: Θ(|V| + |E|) for neighbor lists and edge lists, and Θ(|V|²) for the matrix. Other algorithms are marked “Coming soon.”

The site can be installed as a PWA in supported browsers. After the app and its resources load, the service worker caches them for offline use. Production deployments must use HTTPS.

### SEO and GEO (visibility in generative answer engines)

Public pages have route-specific titles, descriptions, canonical URLs, and sharing metadata. The build emits an initial HTML page for each route; `vercel.json` serves these files directly so search crawlers and social previews get the right metadata without waiting for JavaScript. The simulator is marked `noindex` because it is an interactive workspace. `public/robots.txt` allows crawling and points to the sitemap; `public/sitemap.xml` lists only the home, documentation, and legal pages. `public/llms.txt` provides a plain-text project and page summary for tools that choose to read it. JSON-LD describes the site, application, and author. These signals help search and generative systems understand the site; they do not guarantee indexing or citations in generated answers.

After deploying the `graph.fleothing.com` domain to Vercel:

1. Confirm that `https://graph.fleothing.com/robots.txt`, `/sitemap.xml`, and `/llms.txt` are publicly reachable, along with `/` and `/docs`.
2. Add `graph.fleothing.com` as a Domain property in [Google Search Console](https://search.google.com/search-console). Copy Google's TXT record into the authoritative DNS zone for this subdomain, then verify ownership.
3. In Search Console, open **Sitemaps**, submit `sitemap.xml`, then inspect `/` and `/docs` with URL Inspection and request indexing.
4. Review indexing and performance reports over time. Sitemap submission helps Google discover URLs but does not guarantee immediate indexing.

Check metadata and structured data with Google's tools before and after launch. Keep `src/lib/seo.ts`, `scripts/generate-seo-pages.mjs`, `index.html`, `vercel.json`, `public/sitemap.xml`, and `public/llms.txt` aligned when the domain, routes, or project description changes.

### Run the project

```bash
pnpm install
pnpm dev
```

Open the address printed in the terminal.

### JSON format

```json
{
  "nom": "test",
  "sommets": ["A", "B", "C"],
  "aretes": [["A", "B"], ["A", "C"]]
}
```

Each edge connects two existing vertices. Self-loops and duplicate edges are rejected.

### Checks

```bash
pnpm exec biome check .
pnpm exec tsc --noEmit
pnpm build
```
