import type { Graph, GraphEdge } from "@/lib/graph/types";

export type SpanningAlgorithm = "spanning-tree" | "kruskal";
export type SpanningStep = {
	edge: GraphEdge;
	accepted: boolean;
	graph: Graph;
	components: number;
};

/** Build a spanning forest, recording the partial subgraph after each edge. */
export function buildSpanningSteps(
	graph: Graph,
	algorithm: SpanningAlgorithm,
): SpanningStep[] {
	const edges = [...graph.edges];
	if (algorithm === "kruskal") {
		edges.sort(
			(a, b) =>
				(a.weight ?? 1) - (b.weight ?? 1) ||
				a.first.localeCompare(b.first, "en", { numeric: true }) ||
				a.second.localeCompare(b.second, "en", { numeric: true }),
		);
	}
	const parent = new Map(graph.vertices.map((vertex) => [vertex, vertex]));
	const find = (vertex: string): string => {
		const root = parent.get(vertex) ?? vertex;
		if (root === vertex) return root;
		const representative = find(root);
		parent.set(vertex, representative);
		return representative;
	};
	const selected: GraphEdge[] = [];
	let components = graph.vertices.length;
	return edges.map((edge) => {
		const firstRoot = find(edge.first);
		const secondRoot = find(edge.second);
		const accepted = firstRoot !== secondRoot;
		if (accepted) {
			parent.set(secondRoot, firstRoot);
			selected.push(edge);
			components--;
		}
		return {
			edge,
			accepted,
			components,
			graph: { ...graph, edges: [...selected] },
		};
	});
}
