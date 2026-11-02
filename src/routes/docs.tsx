import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	type Language,
	localeFromLanguage,
	text,
	useLanguage,
} from "@/lib/i18n";
import { createPageHead } from "@/lib/seo";

type Section = { title: string; body: string };
const graphExamples = [
	{
		title: { en: "Undirected · unweighted", fr: "Non orienté · non pondéré" },
		config: {
			nom: "test",
			oriente: false,
			pondere: false,
			sommets: ["A", "B", "C"],
			aretes: [
				["A", "B"],
				["A", "C"],
			],
		},
	},
	{
		title: { en: "Directed · unweighted", fr: "Orienté · non pondéré" },
		config: {
			nom: "test",
			oriente: true,
			pondere: false,
			sommets: ["A", "B", "C"],
			aretes: [
				["A", "B"],
				["B", "C"],
			],
		},
	},
	{
		title: { en: "Undirected · weighted", fr: "Non orienté · pondéré" },
		config: {
			nom: "test",
			oriente: false,
			pondere: true,
			sommets: ["A", "B", "C"],
			aretes: [
				["A", "B", 2],
				["A", "C", 3],
			],
		},
	},
	{
		title: { en: "Directed · weighted", fr: "Orienté · pondéré" },
		config: {
			nom: "test",
			oriente: true,
			pondere: true,
			sommets: ["A", "B", "C"],
			aretes: [
				["A", "B", 2],
				["B", "A", 5],
				["C", "C", 1],
			],
		},
	},
] as const;
const docsSectionKey = "graph-simulator-docs-section-v1";

function loadDocsSection(): number | "format" {
	try {
		const saved = window.localStorage.getItem(docsSectionKey);
		if (saved === "format") return saved;
		const index = Number(saved);
		if (Number.isInteger(index) && index >= 0 && index < 7) return index;
	} catch {
		// Keep the documentation usable when browser storage is unavailable.
	}
	return 0;
}

function formatGraphJson(config: (typeof graphExamples)[number]["config"]) {
	const inlineArray = (items: readonly (string | number)[]) =>
		`[${items.map((item) => JSON.stringify(item)).join(", ")}]`;
	return [
		"{",
		`  "nom": ${JSON.stringify(config.nom)},`,
		`  "oriente": ${config.oriente},`,
		`  "pondere": ${config.pondere},`,
		`  "sommets": ${inlineArray(config.sommets)},`,
		`  "aretes": [${config.aretes.map(inlineArray).join(", ")}]`,
		"}",
	].join("\n");
}

const copy: Record<
	Language,
	{ intro: string; sections: Section[]; format: string; back: string }
> = {
	fr: {
		intro:
			"Choisissez un graphe orienté ou non orienté, avec ou sans poids, puis explorez ses représentations et ses propriétés.",
		sections: [
			{
				title: "Créer un graphe",
				body: "Choisissez l’orientation et la pondération, puis donnez un nom au graphe. Un changement de type confirmé restaure l’exemple A–D en conservant son nom. Ajoutez ensuite des sommets et reliez-les ; les graphes pondérés demandent un poids numérique. Les graphes orientés acceptent aussi les boucles réflexives, comme A → A. Sur téléphone, ouvrez « Modifier le graphe » pour afficher les commandes et gardez le dessin visible par défaut.",
			},
			{
				title: "Lire la visualisation",
				body: "Cliquez sur un sommet, ou sélectionnez-le au clavier avec Entrée ou Espace. Le panneau sous le dessin indique son degré, sa composante connexe et les cycles simples qui le traversent.",
			},
			{
				title: "Composantes et cycles",
				body: "Une composante regroupe les sommets reliés ; pour un graphe orienté, les composantes affichées sont faibles et ignorent le sens des arcs. Le degré entrant et le degré sortant comptent respectivement les arcs qui arrivent au sommet et ceux qui en partent. Un cycle simple revient à son départ en respectant le sens des arcs.",
			},
			{
				title: "Représentations et algorithmes",
				body: "Choisissez les listes de voisins, la matrice ou la liste d’arêtes dans le menu, puis lancez la représentation ou déboguez-la pas à pas. En orienté, les listes montrent les voisins sortants et la matrice n’est pas symétrique ; en pondéré, la matrice contient les poids et ∞ indique l’absence d’arête. Chaque test de boucle, branche de condition et retour à la boucle apparaît dans la trace. Les étapes actives sont surlignées en bleu. Complexité : Θ(|V| + |E|) pour les listes et arêtes, Θ(|V|²) pour la matrice.",
			},
			{
				title: "Importer et télécharger",
				body: "Le graphe est enregistré automatiquement dans ce navigateur. Les boutons du simulateur importent ou exportent un fichier JSON. Les arêtes pondérées utilisent le format [sommet de départ, sommet d’arrivée, poids] ; les anciennes arêtes à deux sommets restent compatibles.",
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
			"Choose a directed or undirected graph, with or without weights, then explore its representations and properties.",
		sections: [
			{
				title: "Create a graph",
				body: "Choose the orientation and weighting, then name the graph. Confirming a type change restores the A–D sample graph and keeps its name. Add vertices and connect them; weighted graphs ask for a numeric weight. Directed graphs also allow reflexive loops such as A → A. On phones, open “Edit graph” to show the controls; the drawing stays visible by default.",
			},
			{
				title: "Read the visualization",
				body: "Click a vertex, or focus it and press Enter or Space. The panel below the drawing shows its degree, connected component, and the simple cycles that include it.",
			},
			{
				title: "Components and cycles",
				body: "A component groups connected vertices; for directed graphs, the displayed weak components ignore arc direction. In-degree and out-degree count arcs entering and leaving a vertex. A simple cycle returns to its start while following arc directions.",
			},
			{
				title: "Representations and algorithms",
				body: "Choose neighbor lists, the matrix, or the edge list from the menu, then run the representation or debug it one step at a time. Directed neighbor lists show outgoing neighbors and their matrix is not symmetric; weighted matrices contain edge weights and use ∞ for a missing edge. The trace shows every loop check, condition branch, and return to a loop, with active steps highlighted in blue. Complexity: Θ(|V| + |E|) for lists and edges, Θ(|V|²) for the matrix.",
			},
			{
				title: "Import and download",
				body: "Your graph is saved automatically in this browser. Use the simulator buttons to import or export JSON. Weighted edges use [source vertex, destination vertex, weight]; existing two-vertex edge entries remain supported.",
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
	const [activeSection, setActiveSection] = useState<number | "format">(
		loadDocsSection,
	);
	const content = copy[language];
	useEffect(() => {
		try {
			window.localStorage.setItem(docsSectionKey, String(activeSection));
		} catch {
			// Keep navigation usable when browser storage is unavailable.
		}
	}, [activeSection]);
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
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								{text(
									language,
									"If oriente or pondere is omitted, it defaults to false.",
									"Si oriente ou pondere est absent, sa valeur par défaut est false.",
								)}
							</p>
							<div className="mt-5 grid gap-4 xl:grid-cols-2">
								{graphExamples.map(({ title, config }) => (
									<article
										key={title.en}
										className="min-w-0 overflow-hidden rounded-lg border border-border"
									>
										<h3 className="border-b border-border px-4 py-3 text-sm font-medium">
											{title[language]}
										</h3>
										<pre className="overflow-x-auto bg-foreground p-4 text-xs leading-5 text-background">
											<code>{formatGraphJson(config)}</code>
										</pre>
									</article>
								))}
							</div>
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
				"Apprenez à créer des graphes orientés ou non orientés, pondérés ou non, et à lire leurs représentations, composantes et cycles.",
			path: "/docs",
		}),
	component: DocsPage,
});
