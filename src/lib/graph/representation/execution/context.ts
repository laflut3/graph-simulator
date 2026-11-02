import type { Graph, GraphEdge, Vertex } from "@/lib/graph/types";
import type { Language } from "@/lib/i18n";
import type { GraphConstructionStep } from "../types";

export function createExecution(graph: Graph, language: Language) {
	const built: Graph = { ...graph, vertices: [], edges: [] };
	const steps: GraphConstructionStep[] = [];
	const snapshot = (): Graph => ({
		...built,
		vertices: [...built.vertices],
		edges: [...built.edges],
	});
	const addStep = (
		title: string,
		codeLine = 0,
		currentVertex?: Vertex,
		currentEdge?: GraphEdge,
	) => {
		steps.push({
			graph: snapshot(),
			title,
			codeLine,
			currentVertex,
			currentEdge,
		});
	};
	const message = (en: string, fr: string) => (language === "en" ? en : fr);
	const addVertices = () => {
		addStep(message("Initialize empty graph", "Initialiser le graphe vide"));
		for (const vertex of graph.vertices) {
			addStep(
				message(
					`Check vertex loop: ${vertex} is next`,
					`Tester la boucle des sommets : ${vertex} est suivant`,
				),
				1,
				vertex,
			);
			built.vertices.push(vertex);
			addStep(
				message(`Add vertex ${vertex}`, `Ajouter le sommet ${vertex}`),
				2,
				vertex,
			);
			addStep(
				message("Return to vertex loop", "Retour à la boucle des sommets"),
				1,
				vertex,
			);
		}
		addStep(
			message(
				"Check vertex loop: no vertices left",
				"Tester la boucle des sommets : aucun sommet restant",
			),
			1,
		);
	};
	const finish = () => {
		if (steps.length === 2)
			addStep(message("Graph is empty", "Le graphe est vide"));
		return steps;
	};
	const describeEdge = (edge: GraphEdge) => {
		const endpoints = graph.directed
			? `${edge.first} → ${edge.second}`
			: `{${edge.first}, ${edge.second}}`;
		return graph.weighted ? `${endpoints} : ${edge.weight ?? 1}` : endpoints;
	};
	return { built, steps, addStep, addVertices, finish, message, describeEdge };
}
