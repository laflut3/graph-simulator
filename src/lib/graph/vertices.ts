import type { Graph, GraphUpdate } from "@/lib/graph/types";

export function addVertex(graph: Graph, vertex: string): GraphUpdate {
	const name = vertex.trim();
	if (!name) {
		return { graph, error: "invalid-vertex" };
	}
	if (
		graph.vertices.some(
			(item) => item.toLocaleLowerCase() === name.toLocaleLowerCase(),
		)
	) {
		return { graph, error: "duplicate-vertex" };
	}
	return {
		graph: {
			...graph,
			vertices: [...graph.vertices, name].sort((a, b) =>
				a.localeCompare(b, "fr", { numeric: true }),
			),
		},
		error: null,
	};
}

export function removeVertex(graph: Graph, vertex: string): Graph {
	return {
		vertices: graph.vertices.filter((item) => item !== vertex),
		edges: graph.edges.filter(
			(edge) => edge.first !== vertex && edge.second !== vertex,
		),
	};
}
