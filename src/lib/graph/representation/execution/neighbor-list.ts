import { directedEdgeKey, edgeKey } from "@/lib/graph/analyze";
import type { Graph, GraphEdge } from "@/lib/graph/types";
import type { Language } from "@/lib/i18n";
import { createNeighborLists } from "../structures";
import { createExecution } from "./context";

export function buildFromNeighborList(graph: Graph, language: Language) {
	const { built, addStep, addVertices, finish, message, describeEdge } =
		createExecution(graph, language);
	const neighbors = createNeighborLists(graph);
	const seen = new Set<string>();
	addVertices();
	for (const vertex of graph.vertices) {
		addStep(
			message(
				`Check vertex loop: u = ${vertex}`,
				`Tester la boucle des sommets : u = ${vertex}`,
			),
			3,
			vertex,
		);
		for (const neighbor of neighbors.get(vertex) ?? []) {
			const edge: GraphEdge = { first: vertex, second: neighbor };
			addStep(
				message(
					`Check neighbor loop: v = ${neighbor}`,
					`Tester la boucle des voisins : v = ${neighbor}`,
				),
				4,
				vertex,
				edge,
			);
			const key = graph.directed
				? directedEdgeKey(vertex, neighbor)
				: edgeKey(vertex, neighbor);
			if (seen.has(key)) {
				addStep(
					message(
						`Condition false: ${describeEdge(edge)} was already added; skip`,
						`Condition fausse : ${describeEdge(edge)} existe déjà ; ignorer`,
					),
					5,
					vertex,
					edge,
				);
			} else {
				seen.add(key);
				addStep(
					message(
						`Condition true: ${describeEdge(edge)} is new`,
						`Condition vraie : ${describeEdge(edge)} est nouvelle`,
					),
					5,
					vertex,
					edge,
				);
				const original = graph.edges.find((item) =>
					graph.directed
						? item.first === vertex && item.second === neighbor
						: edgeKey(item.first, item.second) === edgeKey(vertex, neighbor),
				);
				const added = {
					...edge,
					...(graph.weighted ? { weight: original?.weight ?? 1 } : {}),
				};
				built.edges.push(added);
				addStep(
					message(
						`Add edge ${describeEdge(added)}`,
						`Ajouter l’arête ${describeEdge(added)}`,
					),
					6,
					vertex,
					added,
				);
			}
			addStep(
				message(
					`Return to neighbor loop for u = ${vertex}`,
					`Retour à la boucle des voisins pour u = ${vertex}`,
				),
				4,
				vertex,
				edge,
			);
		}
		addStep(
			message(
				`Return to neighbor loop for u = ${vertex}: no neighbors left`,
				`Retour à la boucle des voisins pour u = ${vertex} : aucun voisin restant`,
			),
			4,
			vertex,
		);
		addStep(
			message("Return to vertex loop", "Retour à la boucle des sommets"),
			3,
			vertex,
		);
	}
	addStep(
		message(
			"Check vertex loop: no vertices left",
			"Tester la boucle des sommets : aucun sommet restant",
		),
		3,
	);
	return finish();
}
