import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { type Language, localeFromLanguage, useLanguage } from "@/lib/i18n";
import { createPageHead } from "@/lib/seo";

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
				body: "Donnez un nom au graphe, puis ajoutez des sommets avec un nom ou un mot. Choisissez deux sommets pour ajouter une arête. Les listes montrent les éléments présents ; le bouton × les supprime.",
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
				title: "Représentations et algorithmes",
				body: "Choisissez les listes de voisins, la matrice ou la liste d’arêtes. ▶ reconstruit le graphe ; l’icône debug avance une instruction à la fois. Chaque test de boucle, branche de condition et retour à la boucle apparaît dans la trace. Le pseudo-code et l’élément en cours sont surlignés. Complexité : Θ(|V| + |E|) pour les listes et arêtes, Θ(|V|²) pour la matrice.",
			},
			{
				title: "Importer et télécharger",
				body: "Le graphe est enregistré automatiquement dans ce navigateur. Les boutons du simulateur importent ou exportent un fichier JSON ; un import valide remplace le graphe enregistré.",
			},
			{
				title: "Installer l’application",
				body: "Sur un navigateur compatible, utilisez le bouton Installer ou le menu du navigateur. Après le chargement du site et de ses ressources, le simulateur peut aussi s’ouvrir hors ligne.",
			},
			{
				title: "Choisir la langue",
				body: "L’anglais est la langue par défaut. Choisissez Français dans le menu pour passer sur /fr-fr/ ; English ouvre /en-us/.",
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
				body: "Name the graph, then add vertices using names or words. Choose two vertices to add an edge. The lists show the current elements; use × to remove one.",
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
				title: "Representations and algorithms",
				body: "Choose neighbor lists, the matrix, or the edge list. ▶ rebuilds the graph; the bug icon advances one instruction at a time. The trace shows every loop check, condition branch, and return to a loop. The pseudocode and current element are highlighted. Complexity: Θ(|V| + |E|) for lists and edges, Θ(|V|²) for the matrix.",
			},
			{
				title: "Import and download",
				body: "Your graph is saved automatically in this browser. Use the simulator buttons to import or export JSON; a valid import replaces the saved graph.",
			},
			{
				title: "Install the app",
				body: "In a supported browser, use the Install button or the browser menu. Once the site and its resources have loaded, the simulator can also open offline.",
			},
			{
				title: "Choose a language",
				body: "English is the default. Choose Français in the menu to switch to /fr-fr/; English opens /en-us/.",
			},
		],
		format: "JSON format",
		back: "Open the simulator",
	},
};

export function DocsPage() {
	const [language] = useLanguage();
	const locale = localeFromLanguage(language);
	const [activeSection, setActiveSection] = useState<number | "format">(0);
	const content = copy[language];
	const navItems = [
		...content.sections.map(({ title }) => title),
		content.format,
	];
	const activeContent =
		typeof activeSection === "number" ? content.sections[activeSection] : null;

	return (
		<main className="w-full px-4 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
			<header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
				<div>
					<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
						Graph Simulator
					</p>
					<h1 className="mt-2 text-3xl font-medium tracking-tight">
						Documentation
					</h1>
				</div>
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
					to="/$locale/$page"
					params={{ locale, page: "simulator" }}
					className="text-sm font-medium underline underline-offset-4"
				>
					{content.back} →
				</Link>
			</p>
		</main>
	);
}

export const Route = createFileRoute("/docs")({
	beforeLoad: () => {
		const language: Language =
			window.localStorage.getItem("graph-simulator-language") === "fr"
				? "fr"
				: "en";
		throw redirect({
			to: "/$locale/$page",
			params: { locale: localeFromLanguage(language), page: "docs" },
		});
	},
	head: () =>
		createPageHead({
			title: "Documentation du simulateur de graphes | Graph Simulator",
			description:
				"Apprenez à créer un graphe non orienté, lire sa matrice d’adjacence et ses listes de voisins, et comprendre ses composantes et cycles.",
			path: "/docs",
		}),
	component: DocsPage,
});
