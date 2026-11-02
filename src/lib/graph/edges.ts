import { createGraph } from "@/lib/graph/create";
import type { Graph, GraphEdge, GraphUpdate } from "@/lib/graph/types";

function sameEdge(a: GraphEdge, b: GraphEdge, directed: boolean) {
	return (
		(a.first === b.first && a.second === b.second) ||
		(!directed && a.first === b.second && a.second === b.first)
	);
}

export function addEdge(
	graph: Graph,
	first: string,
	second: string,
	weight?: number,
): GraphUpdate {
	if (
		!graph.vertices.includes(first) ||
		!graph.vertices.includes(second) ||
		(first === second && !graph.directed)
	)
		return { graph, error: "invalid-edge" };
	if (graph.weighted && (weight === undefined || !Number.isFinite(weight)))
		return { graph, error: "invalid-weight" };
	if (
		graph.edges.some((edge) =>
			sameEdge(edge, { first, second }, graph.directed),
		)
	)
		return { graph, error: "duplicate-edge" };

	const edge = graph.directed
		? { first, second, ...(graph.weighted ? { weight } : {}) }
		: {
				first:
					first.localeCompare(second, "fr", { numeric: true }) <= 0
						? first
						: second,
				second:
					first.localeCompare(second, "fr", { numeric: true }) <= 0
						? second
						: first,
				...(graph.weighted ? { weight } : {}),
			};
	return {
		graph: {
			...graph,
			edges: [...graph.edges, edge].sort(
				(a, b) =>
					a.first.localeCompare(b.first, "fr", { numeric: true }) ||
					a.second.localeCompare(b.second, "fr", { numeric: true }),
			),
		},
		error: null,
	};
}

export function removeEdge(graph: Graph, edgeToRemove: GraphEdge): Graph {
	return {
		...graph,
		edges: graph.edges.filter(
			(edge) => !sameEdge(edge, edgeToRemove, graph.directed),
		),
	};
}

export function updateGraphType(
	graph: Graph,
	patch: Partial<Pick<Graph, "directed" | "weighted">>,
): Graph {
	const directed = patch.directed ?? graph.directed;
	const weighted = patch.weighted ?? graph.weighted;
	const sample = createGraph();
	return {
		...graph,
		directed,
		weighted,
		vertices: sample.vertices,
		edges: sample.edges.map((edge) => ({
			...edge,
			...(weighted ? { weight: 1 } : {}),
		})),
	};
}
