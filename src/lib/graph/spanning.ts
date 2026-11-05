import type { Graph, GraphEdge } from "@/lib/graph/types";

export type SpanningAlgorithm = "components" | "spanning-tree" | "kruskal";
export type SpanningStep = {
	edge?: GraphEdge;
	accepted?: boolean;
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

const componentsCodeLines = [
	"for each vertex x:",
	"  comp[x] ← x",
	"for each edge xy in E:",
	"  if comp[x] ≠ comp[y]:",
	"    newCC ← comp[x]",
	"    oldCC ← comp[y]",
	"    for each vertex z:",
	"      if comp[z] = oldCC:",
	"        comp[z] ← newCC",
	"return comp",
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
	if (algorithm === "kruskal") return kruskalCodeLines;
	if (algorithm === "components") return componentsCodeLines;
	return spanningTreeCodeLines;
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

/** Record every executed pseudocode line for the component and spanning algorithms. */
export function buildSpanningSteps(
	graph: Graph,
	algorithm: SpanningAlgorithm,
): SpanningStep[] {
	const edges =
		algorithm === "kruskal" ? sortEdgesByWeight(graph) : [...graph.edges];
	const labels = new Map<string, string>();
	const selected: GraphEdge[] = [];
	let currentGraph =
		algorithm === "components" ? graph : { ...graph, edges: [] };
	const steps: SpanningStep[] = [];
	const record = (codeLine: number, edge?: GraphEdge, accepted?: boolean) => {
		steps.push({
			edge,
			accepted,
			codeLine,
			componentLabels: graph.vertices.map((vertex) => [
				vertex,
				labels.get(vertex) ?? "—",
			]),
			components:
				graph.vertices.length - labels.size + new Set(labels.values()).size,
			graph: currentGraph,
		});
	};
	const merge = (
		edge: GraphEdge,
		lines: { next: number; previous: number },
	) => {
		const newCC = labels.get(edge.first) ?? edge.first;
		record(lines.next, edge, true);
		const oldCC = labels.get(edge.second) ?? edge.second;
		record(lines.previous, edge, true);
		if (algorithm !== "components") {
			selected.push(edge);
			currentGraph = { ...graph, edges: [...selected] };
			record(algorithm === "kruskal" ? 8 : 7, edge, true);
		}
		for (const vertex of graph.vertices) {
			const matchesOld = labels.get(vertex) === oldCC;
			if (algorithm === "components") {
				record(7, edge, true);
				record(8, edge, matchesOld);
			} else if (algorithm === "kruskal") {
				record(9, edge, true);
				record(10, edge, matchesOld);
			} else {
				record(8, edge, true);
			}
			if (matchesOld) {
				labels.set(vertex, newCC);
				if (algorithm === "components") record(9, edge, true);
				else if (algorithm === "kruskal") record(11, edge, true);
			}
			if (algorithm === "spanning-tree") record(9, edge, matchesOld);
		}
	};

	if (algorithm === "kruskal") record(1);
	if (algorithm === "components") {
		for (const vertex of graph.vertices) {
			record(1);
			labels.set(vertex, vertex);
			record(2);
		}
	} else {
		if (algorithm === "kruskal") record(2);
		for (const vertex of graph.vertices) {
			labels.set(vertex, vertex);
			record(algorithm === "kruskal" ? 3 : 2);
		}
	}

	for (const edge of edges) {
		record(
			algorithm === "kruskal" ? 4 : algorithm === "components" ? 3 : 3,
			edge,
		);
		const accepted = labels.get(edge.first) !== labels.get(edge.second);
		record(algorithm === "kruskal" ? 5 : 4, edge, accepted);
		if (!accepted) continue;
		merge(
			edge,
			algorithm === "components"
				? { next: 5, previous: 6 }
				: {
						next: algorithm === "kruskal" ? 6 : 5,
						previous: algorithm === "kruskal" ? 7 : 6,
					},
		);
	}
	record(algorithm === "kruskal" ? 12 : algorithm === "components" ? 10 : 10);
	return steps;
}
