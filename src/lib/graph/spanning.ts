import type { Graph, GraphEdge } from "@/lib/graph/types";

export type SpanningAlgorithm = "spanning-tree" | "kruskal";
export type SpanningStep = {
	edge: GraphEdge;
	accepted: boolean;
	codeLine: number;
	componentLabels: Array<[string, string]>;
	graph: Graph;
	components: number;
};

const spanningTreeCodeLines = [
	"A ← ∅",
	"for each vertex v: comp[v] ← v",
	"for each edge xy in E:",
	"  if comp[x] ≠ comp[y]:",
	"    newCC ← comp[x]",
	"    oldCC ← comp[y]",
	"    A ← A ∪ {xy}",
	"    for each vertex z:",
	"      if comp[z] = oldCC: comp[z] ← newCC",
	"return A",
];

const kruskalCodeLines = [
	"sort E by increasing weight",
	"A ← ∅",
	"for each vertex v: comp[v] ← v",
	"for each edge xy in sorted E:",
	"  if comp[x] ≠ comp[y]:",
	"    newCC ← comp[x]",
	"    oldCC ← comp[y]",
	"    A ← A ∪ {xy}",
	"    for each vertex z:",
	"      if comp[z] = oldCC:",
	"        comp[z] ← newCC",
	"return A",
];

export function getSpanningPseudocode(algorithm: SpanningAlgorithm) {
	return algorithm === "kruskal" ? kruskalCodeLines : spanningTreeCodeLines;
}

export function sortEdgesByWeight(graph: Graph): GraphEdge[] {
	return [...graph.edges].sort((a, b) => {
		const [aFirst, aSecond] = [a.first, a.second].sort((x, y) =>
			x.localeCompare(y, "en", { numeric: true }),
		);
		const [bFirst, bSecond] = [b.first, b.second].sort((x, y) =>
			x.localeCompare(y, "en", { numeric: true }),
		);
		return (
			(a.weight ?? 1) - (b.weight ?? 1) ||
			aFirst.localeCompare(bFirst, "en", { numeric: true }) ||
			aSecond.localeCompare(bSecond, "en", { numeric: true })
		);
	});
}

/** Build a spanning forest, recording the partial subgraph after each edge. */
export function buildSpanningSteps(
	graph: Graph,
	algorithm: SpanningAlgorithm,
): SpanningStep[] {
	const edges =
		algorithm === "kruskal" ? sortEdgesByWeight(graph) : [...graph.edges];
	const labels = new Map(graph.vertices.map((vertex) => [vertex, vertex]));
	const selected: GraphEdge[] = [];
	let components = graph.vertices.length;
	return edges.map((edge) => {
		const firstLabel = labels.get(edge.first) ?? edge.first;
		const secondLabel = labels.get(edge.second) ?? edge.second;
		const accepted = firstLabel !== secondLabel;
		if (accepted) {
			for (const vertex of graph.vertices) {
				if (labels.get(vertex) === secondLabel) labels.set(vertex, firstLabel);
			}
			selected.push(edge);
			components--;
		}
		return {
			edge,
			accepted,
			codeLine: accepted
				? algorithm === "kruskal"
					? 11
					: 9
				: algorithm === "kruskal"
					? 5
					: 4,
			componentLabels: graph.vertices.map((vertex) => [
				vertex,
				labels.get(vertex) ?? vertex,
			]),
			components,
			graph: { ...graph, edges: [...selected] },
		};
	});
}
