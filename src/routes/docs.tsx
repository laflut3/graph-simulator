import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Language = "fr" | "en";

const copy = {
	fr: {
		title: "Documentation",
		intro:
			"Le simulateur représente un graphe non orienté simple : ses arêtes relient des paires de sommets, sans direction ni boucle.",
		sections: [
			[
				"Créer un graphe",
				"Dans le simulateur, ajoutez des sommets avec un nom ou un mot. Choisissez deux sommets pour ajouter une arête. Les listes affichent les éléments présents ; le bouton × les supprime.",
			],
			[
				"Lire la visualisation",
				"Cliquez sur un sommet, ou sélectionnez-le au clavier avec Entrée ou Espace. Le panneau sous le dessin affiche son degré, sa composante connexe et les cycles simples qui le traversent. Les éléments liés sont mis en évidence.",
			],
			[
				"Composantes et cycles",
				"Une composante connexe regroupe les sommets que l’on peut atteindre les uns depuis les autres. Le degré d’un sommet est le nombre d’arêtes qui le touchent. Un cycle simple revient à son sommet de départ sans repasser par un sommet intermédiaire.",
			],
			[
				"Importer et télécharger",
				"Les boutons en haut du simulateur permettent de charger ou de télécharger un fichier JSON. L’import vérifie les sommets et les arêtes avant de remplacer le graphe.",
			],
		],
		format: "Format du fichier",
		back: "Ouvrir le simulateur",
	},
	en: {
		title: "Documentation",
		intro:
			"The simulator represents a simple undirected graph. Its edges connect pairs of vertices, with no direction or loops.",
		sections: [
			[
				"Create a graph",
				"In the simulator, add vertices using names or words. Choose two vertices to add an edge. The lists show the current elements; use × to remove one.",
			],
			[
				"Read the visualization",
				"Click a vertex, or focus it and press Enter or Space. The panel below the drawing shows its degree, connected component, and the simple cycles that include it. Related vertices and edges are highlighted.",
			],
			[
				"Components and cycles",
				"A connected component groups vertices that can reach one another. A vertex’s degree is the number of edges that touch it. A simple cycle returns to its starting vertex without revisiting an intermediate vertex.",
			],
			[
				"Import and download",
				"Use the buttons at the top of the simulator to load or download a JSON file. The importer checks the vertices and edges before replacing the graph.",
			],
		],
		format: "File format",
		back: "Open the simulator",
	},
} satisfies Record<
	Language,
	{
		title: string;
		intro: string;
		sections: [string, string][];
		format: string;
		back: string;
	}
>;

function DocsPage() {
	const [language, setLanguage] = useState<Language>("fr");
	const content = copy[language];
	return (
		<main className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
			<header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
				<div>
					<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
						Graph Simulator
					</p>
					<h1 className="mt-2 text-3xl font-medium tracking-tight">
						{content.title}
					</h1>
				</div>
				<fieldset className="flex gap-2">
					<legend className="sr-only">Documentation language</legend>
					<Button
						type="button"
						size="sm"
						variant={language === "fr" ? "default" : "outline"}
						aria-pressed={language === "fr"}
						onClick={() => setLanguage("fr")}
					>
						Français
					</Button>
					<Button
						type="button"
						size="sm"
						variant={language === "en" ? "default" : "outline"}
						aria-pressed={language === "en"}
						onClick={() => setLanguage("en")}
					>
						English
					</Button>
				</fieldset>
			</header>
			<p className="max-w-3xl py-6 text-base leading-7 text-muted-foreground">
				{content.intro}
			</p>
			<div className="divide-y divide-border border-y border-border">
				{content.sections.map(([heading, body], index) => (
					<section
						key={heading}
						className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr] sm:gap-5"
					>
						<span className="font-mono text-xs text-muted-foreground">
							0{index + 1}
						</span>
						<div>
							<h2 className="text-base font-medium">{heading}</h2>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
								{body}
							</p>
						</div>
					</section>
				))}
			</div>
			<section className="mt-8 rounded-xl border border-border bg-muted/20 p-5 sm:p-6">
				<h2 className="text-sm font-medium">{content.format}</h2>
				<pre className="mt-4 overflow-x-auto rounded-lg bg-foreground p-4 text-sm leading-6 text-background">
					<code>{`{
  "nom": "test",
  "sommets": ["A", "B", "C"],
  "aretes": [["A", "B"], ["A", "C"]]
}`}</code>
				</pre>
			</section>
			<p className="mt-8">
				<a
					href="/simulator"
					className="text-sm font-medium underline underline-offset-4"
				>
					{content.back} →
				</a>
			</p>
		</main>
	);
}

export const Route = createFileRoute("/docs")({ component: DocsPage });
