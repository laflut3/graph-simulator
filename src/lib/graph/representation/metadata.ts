import type { Language } from "@/lib/i18n";
import type { GraphRepresentation } from "./types";

export const representationComplexity: Record<GraphRepresentation, string> = {
	"neighbor-list": "Θ(|V| + |E|)",
	"adjacency-matrix": "Θ(|V|²)",
	"edge-list": "Θ(|V| + |E|)",
};

export function graphRepresentationName(
	representation: GraphRepresentation,
	language: Language = "en",
) {
	const names = {
		en: {
			"neighbor-list": "Neighbor lists",
			"adjacency-matrix": "Adjacency matrix",
			"edge-list": "Edge list",
		},
		fr: {
			"neighbor-list": "Listes de voisins",
			"adjacency-matrix": "Matrice d’adjacence",
			"edge-list": "Liste d’arêtes",
		},
	};
	return names[language][representation];
}
