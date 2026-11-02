# Graph Simulator

## Français

Application web pour créer et étudier des graphes non orientés simples. La page d’accueil présente le projet ; le simulateur permet d’ajouter des sommets et des arêtes, d’inspecter les composantes connexes et les cycles, et d’importer ou télécharger une configuration JSON. La documentation intégrée est disponible en français et en anglais.

La navigation comprend l’accueil (`/`), le simulateur (`/simulator`), la documentation bilingue (`/docs`) et les informations légales (`/legal`). Le thème peut suivre le système ou être fixé en clair ou en sombre.

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
