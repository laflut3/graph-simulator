import type { Graph, GraphEdge, GraphUpdate } from "@/lib/graph/types";

export function addEdge(
	graph: Graph,
	first: number,
	second: number,
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
		first: Math.min(first, second),
		second: Math.max(first, second),
	};
	return {
		graph: {
			...graph,
			edges: [...graph.edges, edge].sort(
				(a, b) => a.first - b.first || a.second - b.second,
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
