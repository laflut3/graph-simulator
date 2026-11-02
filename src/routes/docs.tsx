import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Language = "fr" | "en";
type Section = { title: string; body: string };

const copy: Record<
	Language,
	{ intro: string; sections: Section[]; format: string; back: string }
> = {
	fr: {
		intro:
			"Le simulateur représente un graphe non orienté simple : ses arêtes relient des paires de sommets, sans direction ni boucle.",
		sections: [
			{
				title: "Créer un graphe",
				body: "Ajoutez des sommets avec un nom ou un mot. Choisissez deux sommets pour ajouter une arête. Les listes montrent les éléments présents ; le bouton × les supprime.",
			},
			{
				title: "Lire la visualisation",
				body: "Cliquez sur un sommet, ou sélectionnez-le au clavier avec Entrée ou Espace. Le panneau sous le dessin indique son degré, sa composante connexe et les cycles simples qui le traversent.",
			},
			{
				title: "Composantes et cycles",
				body: "Une composante connexe regroupe les sommets que l’on peut atteindre les uns depuis les autres. Le degré d’un sommet compte ses arêtes. Un cycle simple revient à son départ sans repasser par un sommet intermédiaire.",
			},
			{
				title: "Importer et télécharger",
				body: "Les boutons du simulateur chargent ou téléchargent un fichier JSON. L’import vérifie les sommets et les arêtes avant de remplacer le graphe.",
			},
		],
		format: "Format JSON",
		back: "Ouvrir le simulateur",
	},
	en: {
		intro:
			"The simulator represents a simple undirected graph. Its edges connect pairs of vertices, with no direction or loops.",
		sections: [
			{
				title: "Create a graph",
				body: "Add vertices using names or words. Choose two vertices to add an edge. The lists show the current elements; use × to remove one.",
			},
			{
				title: "Read the visualization",
				body: "Click a vertex, or focus it and press Enter or Space. The panel below the drawing shows its degree, connected component, and the simple cycles that include it.",
			},
			{
				title: "Components and cycles",
				body: "A connected component groups vertices that can reach one another. A vertex’s degree counts its edges. A simple cycle returns to its starting vertex without revisiting an intermediate vertex.",
			},
			{
				title: "Import and download",
				body: "Use the simulator buttons to load or download a JSON file. The importer checks the vertices and edges before replacing the graph.",
			},
		],
		format: "JSON format",
		back: "Open the simulator",
	},
};

function DocsPage() {
	const [language, setLanguage] = useState<Language>("fr");
	const [activeSection, setActiveSection] = useState<number | "format">(0);
	const content = copy[language];
	const navItems = [
		...content.sections.map(({ title }) => title),
		content.format,
	];
	const activeContent =
		typeof activeSection === "number" ? content.sections[activeSection] : null;

	return (
		<main className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
			<header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
				<div>
					<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
						Graph Simulator
					</p>
					<h1 className="mt-2 text-3xl font-medium tracking-tight">
						Documentation
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
			<p className="max-w-3xl py-6 text-sm leading-6 text-muted-foreground sm:text-base">
				{content.intro}
			</p>
			<div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
				<nav
					aria-label={
						language === "fr"
							? "Sections de la documentation"
							: "Documentation sections"
					}
					className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
				>
					{navItems.map((title, index) => {
						const selected =
							activeSection ===
							(index === content.sections.length ? "format" : index);
						return (
							<button
								key={title}
								type="button"
								aria-current={selected ? "page" : undefined}
								onClick={() =>
									setActiveSection(
										index === content.sections.length ? "format" : index,
									)
								}
								className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${selected ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
							>
								<span className="mr-2 font-mono text-[11px] opacity-60">
									{String(index + 1).padStart(2, "0")}
								</span>
								{title}
							</button>
						);
					})}
				</nav>
				<section
					aria-live="polite"
					className="min-h-64 rounded-xl border border-border bg-muted/10 p-5 sm:p-8"
				>
					{activeContent ? (
						<>
							<p className="font-mono text-xs text-muted-foreground">
								{String(content.sections.indexOf(activeContent) + 1).padStart(
									2,
									"0",
								)}
							</p>
							<h2 className="mt-3 text-xl font-medium">
								{activeContent.title}
							</h2>
							<p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
								{activeContent.body}
							</p>
						</>
					) : (
						<>
							<h2 className="text-xl font-medium">{content.format}</h2>
							<pre className="mt-5 overflow-x-auto rounded-lg bg-foreground p-4 text-sm leading-6 text-background">
								<code>{`{
  "nom": "test",
  "sommets": ["A", "B", "C"],
  "aretes": [["A", "B"], ["A", "C"]]
}`}</code>
							</pre>
						</>
					)}
				</section>
			</div>
			<p className="mt-8">
				<Link
					to="/simulator"
					className="text-sm font-medium underline underline-offset-4"
				>
					{content.back} →
				</Link>
			</p>
		</main>
	);
}

export const Route = createFileRoute("/docs")({ component: DocsPage });
