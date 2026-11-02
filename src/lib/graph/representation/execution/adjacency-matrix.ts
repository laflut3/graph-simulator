import type { Graph } from "@/lib/graph/types";
import type { Language } from "@/lib/i18n";
import { createAdjacencyMatrix } from "../structures";
import { createExecution } from "./context";

export function buildFromAdjacencyMatrix(graph: Graph, language: Language) {
	const { built, addStep, addVertices, finish, message, describeEdge } =
		createExecution(graph, language);
	const matrix = createAdjacencyMatrix(graph);
	addVertices();
	for (let row = 0; row < graph.vertices.length; row++) {
		const first = graph.vertices[row];
		if (first === undefined) continue;
		addStep(
			message(
				`Check row loop: i = ${row + 1}`,
				`Tester la boucle des lignes : i = ${row + 1}`,
			),
			3,
			first,
		);
		for (
			let column = graph.directed ? 0 : row + 1;
			column < graph.vertices.length;
			column++
		) {
			const second = graph.vertices[column];
			if (second === undefined) continue;
			addStep(
				message(
					`Check column loop: j = ${column + 1}`,
					`Tester la boucle des colonnes : j = ${column + 1}`,
				),
				4,
				first,
				{ first, second },
			);
			const value = matrix[row][column];
			if (value !== null) {
				addStep(
					message(
						`Condition true: A[${first}, ${second}] = ${value}`,
						`Condition vraie : A[${first}, ${second}] = ${value}`,
					),
					5,
					first,
					{ first, second },
				);
				const edge = {
					first,
					second,
					...(graph.weighted ? { weight: value } : {}),
				};
				built.edges.push(edge);
				addStep(
					message(
						`Add edge ${describeEdge(edge)}`,
						`Ajouter l’arête ${describeEdge(edge)}`,
					),
					6,
					second,
					edge,
				);
			} else {
				const empty = graph.weighted ? "∞" : "0";
				addStep(
					message(
						`Condition false: A[${first}, ${second}] = ${empty}; skip`,
						`Condition fausse : A[${first}, ${second}] = ${empty} ; ignorer`,
					),
					5,
					first,
					{ first, second },
				);
			}
			addStep(
				message(
					`Return to column loop for i = ${row + 1}`,
					`Retour à la boucle des colonnes pour i = ${row + 1}`,
				),
				4,
				first,
			);
		}
		addStep(
			message(
				`Return to column loop for i = ${row + 1}: no columns left`,
				`Retour à la boucle des colonnes pour i = ${row + 1} : aucune colonne restante`,
			),
			4,
			first,
		);
		addStep(
			message("Return to row loop", "Retour à la boucle des lignes"),
			3,
			first,
		);
	}
	addStep(
		message(
			"Check row loop: no rows left",
			"Tester la boucle des lignes : aucune ligne restante",
		),
		3,
	);
	return finish();
}
