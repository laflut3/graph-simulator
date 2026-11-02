import type { Graph } from "@/lib/graph/types";
import type { Language } from "@/lib/i18n";
import type { GraphRepresentation } from "./types";

type CodeLine = { id: string; code: string };

const code = (en: string, fr: string, language: Language) =>
	language === "en" ? en : fr;
const edgeNotation = (
	graph: Graph,
	first: string,
	second: string,
	language: Language,
) => {
	const pair = graph.directed
		? `(${first}, ${second})`
		: `{${first}, ${second}}`;
	return graph.weighted
		? `${pair.slice(0, -1)}, ${code("weight", "poids", language)}${graph.directed ? ")" : "}"}`
		: pair;
};

export function getRepresentationPseudocode(
	graph: Graph,
	representation: GraphRepresentation,
	language: Language,
): CodeLine[] {
	const directed = graph.directed;
	const weighted = graph.weighted;
	const addEdge = (first: string, second: string, indent: string) =>
		`${indent}${code("add", "ajouter", language)} ${edgeNotation(graph, first, second, language)} ${code("to", "à", language)} G'.E`;
	const loop = (noun: string) =>
		code(
			`for each ${noun}`,
			`pour chaque ${noun === "vertex" ? "sommet" : noun === "edge" ? "arête" : noun}`,
			language,
		);
	const lines: Record<GraphRepresentation, CodeLine[]> = {
		"neighbor-list": [
			{ id: "initialize", code: "G' ← (∅, ∅)" },
			{
				id: "vertices-loop",
				code: `${loop("vertex")} u ${code("in", "de", language)} V:`,
			},
			{
				id: "add-vertex",
				code: `  ${code("add", "ajouter", language)} u ${code("to", "à", language)} G'.V`,
			},
			{
				id: "neighbors-vertices-loop",
				code: `${loop("vertex")} u ${code("in", "de", language)} V:`,
			},
			{
				id: "neighbors-loop",
				code: directed
					? code(
							"  for each outgoing neighbor v of u:",
							"  pour chaque voisin sortant v de u :",
							language,
						)
					: code(
							"  for each v in neighbors[u]:",
							"  pour chaque v dans voisins[u] :",
							language,
						),
			},
			{
				id: "deduplicate",
				code: code(
					`    if ${directed ? "(u, v)" : "{u, v}"} is not processed:`,
					`    si ${directed ? "(u, v)" : "{u, v}"} n'est pas traité :`,
					language,
				),
			},
			{ id: "add-edge", code: addEdge("u", "v", "      ") },
		],
		"adjacency-matrix": [
			{ id: "initialize", code: "G' ← (∅, ∅)" },
			{
				id: "vertices-loop",
				code: `${loop("vertex")} u ${code("in", "de", language)} V:`,
			},
			{
				id: "add-vertex",
				code: `  ${code("add", "ajouter", language)} u ${code("to", "à", language)} G'.V`,
			},
			{
				id: "rows-loop",
				code: code("for i from 1 to |V|:", "pour i de 1 à |V| :", language),
			},
			{
				id: "columns-loop",
				code: directed
					? code("  for j from 1 to |V|:", "  pour j de 1 à |V| :", language)
					: code(
							"  for j from i + 1 to |V|:",
							"  pour j de i + 1 à |V| :",
							language,
						),
			},
			{
				id: "test-edge",
				code: weighted
					? code(
							"    if A[i, j] contains an edge weight:",
							"    si A[i, j] contient un poids d’arête :",
							language,
						)
					: code("    if A[i, j] = 1:", "    si A[i, j] = 1 :", language),
			},
			{ id: "add-edge", code: addEdge("vᵢ", "vⱼ", "      ") },
		],
		"edge-list": [
			{ id: "initialize", code: "G' ← (∅, ∅)" },
			{
				id: "vertices-loop",
				code: `${loop("vertex")} u ${code("in", "de", language)} V:`,
			},
			{
				id: "add-vertex",
				code: `  ${code("add", "ajouter", language)} u ${code("to", "à", language)} G'.V`,
			},
			{
				id: "edges-loop",
				code: code(
					`for each ${directed ? "arc (u, v)" : "edge {u, v}"} in E:`,
					`pour chaque ${directed ? "arc (u, v)" : "arête {u, v}"} de E :`,
					language,
				),
			},
			{ id: "add-edge", code: addEdge("u", "v", "  ") },
		],
	};
	return lines[representation];
}
