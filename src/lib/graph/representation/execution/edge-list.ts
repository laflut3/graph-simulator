import type { Graph } from "@/lib/graph/types";
import type { Language } from "@/lib/i18n";
import { createExecution } from "./context";

export function buildFromEdgeList(graph: Graph, language: Language) {
	const execution = createExecution(graph, language);
	const { built, addStep, addVertices, finish, message, describeEdge } =
		execution;
	addVertices();
	for (const edge of graph.edges) {
		const description = describeEdge(edge);
		addStep(
			message(
				`Check edge loop: ${description} is next`,
				`Tester la boucle des arêtes : ${description} est suivante`,
			),
			3,
			edge.first,
			edge,
		);
		built.edges.push(edge);
		addStep(
			message(`Add edge ${description}`, `Ajouter l’arête ${description}`),
			4,
			edge.second,
			edge,
		);
		addStep(
			message("Return to edge loop", "Retour à la boucle des arêtes"),
			3,
			edge.first,
			edge,
		);
	}
	addStep(
		message(
			"Check edge loop: no edges left",
			"Tester la boucle des arêtes : aucune arête restante",
		),
		3,
	);
	return finish();
}
