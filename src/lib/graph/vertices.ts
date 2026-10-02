import type { Graph, GraphUpdate } from "@/lib/graph/types";

export function addVertex(graph: Graph, vertex: number): GraphUpdate {
	if (!Number.isSafeInteger(vertex) || vertex < 0) {
		return { graph, error: "invalid-vertex" };
	}
	if (graph.vertices.includes(vertex)) {
		return { graph, error: "duplicate-vertex" };
	}
	return {
		graph: {
			...graph,
			vertices: [...graph.vertices, vertex].sort((a, b) => a - b),
		},
		error: null,
	};
}

export function removeVertex(graph: Graph, vertex: number): Graph {
	return {
		vertices: graph.vertices.filter((item) => item !== vertex),
		edges: graph.edges.filter(
			(edge) => edge.first !== vertex && edge.second !== vertex,
		),
	};
}
