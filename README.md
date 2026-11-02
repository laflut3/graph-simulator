# Graph Simulator

## Français

Application web pour créer et étudier des graphes non orientés simples. La page d’accueil présente le projet ; le simulateur permet d’ajouter des sommets et des arêtes, d’inspecter les composantes connexes et les cycles, et d’importer ou télécharger une configuration JSON. La documentation intégrée est disponible en français et en anglais.

La navigation comprend l’accueil (`/`), le simulateur (`/simulator`), la documentation bilingue (`/docs`) et les informations légales (`/legal`). Le thème peut suivre le système ou être fixé en clair ou en sombre.

Le simulateur permet de nommer le graphe et d’examiner sa liste d’arêtes, ses listes de voisins ou sa matrice d’adjacence, dans un panneau à droite du dessin. Les listes de voisins sont sélectionnées par défaut. Le bouton de lecture de chaque représentation reconstruit le dessin, sommet par sommet puis arête par arête. La complexité affichée correspond à cette construction : Θ(|V| + |E|) pour les listes de voisins et la liste d’arêtes, Θ(|V|²) pour la matrice. Les autres algorithmes sont annoncés « Coming soon ».

Le site est installable comme PWA dans les navigateurs compatibles. Après chargement de l’application et de ses ressources, le service worker les garde en cache pour une ouverture hors ligne. En production, le site doit être servi sur HTTPS.

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
