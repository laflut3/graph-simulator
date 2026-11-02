import type { Language } from "@/lib/i18n";

export const siteOrigin = "https://graph.fleothing.com";

export function createPageHead({
	title,
	description,
	path,
	robots = "index, follow",
}: {
	title: string;
	description: string;
	path: string;
	robots?: string;
}) {
	const canonical = `${siteOrigin}${path}`;
	return {
		meta: [
			{ title },
			{ name: "description", content: description },
			{ name: "robots", content: robots },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "Graph Simulator" },
			{ property: "og:locale", content: "en_US" },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: canonical },
			{ property: "og:image", content: `${siteOrigin}/app-icon-512.png` },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: `${siteOrigin}/app-icon-512.png` },
		],
		links: [{ rel: "canonical", href: canonical }],
	};
}

export type PublicPage = "home" | "simulator" | "docs" | "legal";

const pageCopy: Record<
	Language,
	Record<PublicPage, { title: string; description: string }>
> = {
	en: {
		home: {
			title: "Graph Simulator | Create and explore graphs",
			description:
				"Create directed or undirected graphs, add weights, and explore connected components, cycles, and graph representations.",
		},
		simulator: {
			title: "Graph Simulator | Interactive graph editor",
			description:
				"Build a graph in your browser and inspect its representations, connected components, and cycles.",
		},
		docs: {
			title: "Graph Simulator | Documentation",
			description:
				"Learn how to create directed or undirected graphs and read adjacency matrices, neighbor lists, connected components, and cycles.",
		},
		legal: {
			title: "Graph Simulator | Legal information",
			description:
				"Publisher details, privacy policy, cookies, and terms for Graph Simulator.",
		},
	},
	fr: {
		home: {
			title: "Simulateur de graphes | Créer et explorer",
			description:
				"Créez des graphes orientés ou non orientés, ajoutez des poids et explorez leurs composantes, cycles et représentations.",
		},
		simulator: {
			title: "Simulateur de graphes | Éditeur interactif",
			description:
				"Construisez un graphe dans votre navigateur et observez ses représentations, composantes connexes et cycles.",
		},
		docs: {
			title: "Simulateur de graphes | Documentation",
			description:
				"Apprenez à créer des graphes orientés ou non orientés et à lire leurs matrices, listes de voisins, composantes et cycles.",
		},
		legal: {
			title: "Simulateur de graphes | Informations légales",
			description:
				"Éditeur, confidentialité, cookies et conditions d’utilisation de Graph Simulator.",
		},
	},
};

export function createLocalizedPageHead(
	page: PublicPage,
	language: Language,
	path: string,
) {
	const head = createPageHead({
		...pageCopy[language][page],
		path,
		robots: page === "simulator" ? "noindex, follow" : "index, follow",
	});
	return {
		...head,
		meta: head.meta.map((entry) =>
			entry.property === "og:locale"
				? { ...entry, content: language === "en" ? "en_US" : "fr_FR" }
				: entry,
		),
	};
}
