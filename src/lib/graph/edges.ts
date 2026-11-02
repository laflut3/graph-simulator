import type { Graph, GraphEdge, GraphUpdate } from "@/lib/graph/types";

export function addEdge(
	graph: Graph,
	first: string,
	second: string,
): GraphUpdate {
	if (
		!graph.vertices.includes(first) ||
		!graph.vertices.includes(second) ||
		first === second
	) {
		return { graph, error: "invalid-edge" };
	}
	if (
		graph.edges.some(
			(edge) =>
				(edge.first === first && edge.second === second) ||
				(edge.first === second && edge.second === first),
		)
	) {
		return { graph, error: "duplicate-edge" };
	}

	const edge = {
		first:
			first.localeCompare(second, "fr", { numeric: true }) <= 0
				? first
				: second,
		second:
			first.localeCompare(second, "fr", { numeric: true }) <= 0
				? second
				: first,
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
			(edge) =>
				!(
					(edge.first === edgeToRemove.first &&
						edge.second === edgeToRemove.second) ||
					(edge.first === edgeToRemove.second &&
						edge.second === edgeToRemove.first)
				),
		),
	};
}
