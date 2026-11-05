import type { Graph, GraphEdge, Vertex } from "@/lib/graph/types";

export type TraversalAlgorithm = "bfs" | "dfs";

export type TraversalRow = {
	vertex: Vertex;
	parent: Vertex | null;
	level: number | null;
	entry: number | null;
	exit: number | null;
};

export type TraversalStep = {
	codeLine: number;
	currentVertex?: Vertex;
	edge?: GraphEdge;
	accepted?: boolean;
	frontier: Vertex[];
	rows: TraversalRow[];
	graph: Graph;
};

const bfsCodeLines = [
	"for each vertex v: parent[v] ← ⊥; level[v] ← ∞",
	"Q ← empty queue",
	"for each root r in V:",
	"  if level[r] = ∞:",
	"    level[r] ← 0; enqueue(Q, r)",
	"    while Q ≠ ∅:",
	"      u ← dequeue(Q)",
	"      for each outgoing neighbor v of u:",
	"        if level[v] = ∞:",
	"          parent[v] ← u; level[v] ← level[u] + 1",
	"          enqueue(Q, v)",
	"return parent, level",
];

const dfsCodeLines = [
	"for each vertex v: parent[v] ← ⊥; level[v] ← ∞; entry[v] ← ⊥; exit[v] ← ⊥",
	"time ← 0; S ← empty stack",
	"for each root r in V:",
	"  if entry[r] = ⊥: level[r] ← 0; DFS(r)",
	"DFS(u): push(S, u)",
	"  time ← time + 1; entry[u] ← time",
	"  for each outgoing neighbor v of u:",
	"    if entry[v] = ⊥:",
	"      parent[v] ← u; level[v] ← level[u] + 1; DFS(v)",
	"  time ← time + 1; exit[u] ← time",
	"  pop(S)",
	"return parent, entry, exit",
];

export function getTraversalPseudocode(algorithm: TraversalAlgorithm) {
	return algorithm === "bfs" ? bfsCodeLines : dfsCodeLines;
}

/** Record each executed line while building a complete traversal forest. */
export function buildTraversalSteps(
	graph: Graph,
	algorithm: TraversalAlgorithm,
	startVertex?: Vertex,
): TraversalStep[] {
	const rows = new Map<Vertex, TraversalRow>(
		graph.vertices.map((vertex) => [
			vertex,
			{ vertex, parent: null, level: null, entry: null, exit: null },
		]),
	);
	const rowFor = (vertex: Vertex) => {
		const row = rows.get(vertex);
		if (!row) throw new Error(`Unknown traversal vertex: ${vertex}`);
		return row;
	};
	const neighbors = new Map(
		graph.vertices.map((vertex) => [
			vertex,
			[] as Array<{ vertex: Vertex; edge: GraphEdge }>,
		]),
	);
	for (const edge of graph.edges) {
		if (!rows.has(edge.first) || !rows.has(edge.second)) continue;
		neighbors.get(edge.first)?.push({ vertex: edge.second, edge });
		if (!graph.directed) {
			neighbors.get(edge.second)?.push({ vertex: edge.first, edge });
		}
	}
	const roots =
		startVertex && rows.has(startVertex)
			? [
					startVertex,
					...graph.vertices.filter((vertex) => vertex !== startVertex),
				]
			: graph.vertices;

	const frontier: Vertex[] = [];
	const treeEdges: GraphEdge[] = [];
	const steps: TraversalStep[] = [];
	const record = (
		codeLine: number,
		currentVertex?: Vertex,
		edge?: GraphEdge,
		accepted?: boolean,
	) => {
		steps.push({
			codeLine,
			currentVertex,
			edge,
			accepted,
			frontier: [...frontier],
			rows: graph.vertices.map((vertex) => ({ ...rowFor(vertex) })),
			graph: { ...graph, edges: [...treeEdges] },
		});
	};

	for (const vertex of graph.vertices) record(1, vertex);
	record(2);

	if (algorithm === "bfs") {
		for (const root of roots) {
			record(3, root);
			record(4, root);
			const rootRow = rowFor(root);
			if (rootRow.level !== null) continue;
			rootRow.level = 0;
			frontier.push(root);
			record(5, root);
			while (true) {
				record(6);
				const current = frontier.shift();
				if (current === undefined) break;
				record(7, current);
				for (const { vertex, edge } of neighbors.get(current) ?? []) {
					record(8, current, edge);
					const row = rowFor(vertex);
					const undiscovered = row.level === null;
					record(9, vertex, edge, undiscovered);
					if (!undiscovered) continue;
					row.parent = current;
					row.level = (rowFor(current).level ?? 0) + 1;
					treeEdges.push(edge);
					record(10, vertex, edge, true);
					frontier.push(vertex);
					record(11, vertex, edge, true);
				}
			}
		}
	} else {
		let time = 0;
		type Frame = { vertex: Vertex; nextNeighbor: number };
		const frames: Frame[] = [];
		const enter = (vertex: Vertex, edge?: GraphEdge) => {
			frames.push({ vertex, nextNeighbor: 0 });
			frontier.push(vertex);
			record(5, vertex, edge);
			rowFor(vertex).entry = ++time;
			record(6, vertex, edge);
		};
		for (const root of roots) {
			record(3, root);
			const rootRow = rowFor(root);
			if (rootRow.entry !== null) {
				record(4, root);
				continue;
			}
			rootRow.level = 0;
			record(4, root);
			enter(root);
			while (frames.length > 0) {
				const frame = frames[frames.length - 1];
				const neighbor = neighbors.get(frame.vertex)?.[frame.nextNeighbor];
				if (neighbor) {
					frame.nextNeighbor += 1;
					const { vertex, edge } = neighbor;
					record(7, frame.vertex, edge);
					const row = rowFor(vertex);
					const undiscovered = row.entry === null;
					record(8, vertex, edge, undiscovered);
					if (!undiscovered) continue;
					row.parent = frame.vertex;
					row.level = (rowFor(frame.vertex).level ?? 0) + 1;
					treeEdges.push(edge);
					record(9, vertex, edge, true);
					enter(vertex, edge);
				} else {
					rowFor(frame.vertex).exit = ++time;
					record(10, frame.vertex);
					frames.pop();
					frontier.pop();
					record(11, frame.vertex);
				}
			}
		}
	}
	record(12);
	return steps;
}
