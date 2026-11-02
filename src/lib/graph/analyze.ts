import type { Graph, GraphEdge, Vertex } from "@/lib/graph/types";

export type GraphAnalysis = {
	components: Vertex[][];
	cycles: Vertex[][];
	degree: Map<Vertex, number>;
	inDegree: Map<Vertex, number>;
	outDegree: Map<Vertex, number>;
};

/** Compute weak components and simple cycles for directed or undirected graphs. */
export function analyzeGraph(graph: Graph): GraphAnalysis {
	const { vertices, edges, directed } = graph;
	const neighbors = new Map(vertices.map((vertex) => [vertex, [] as Vertex[]]));
	const outgoing = new Map(vertices.map((vertex) => [vertex, [] as Vertex[]]));
	const degree = new Map(vertices.map((vertex) => [vertex, 0]));
	const inDegree = new Map(vertices.map((vertex) => [vertex, 0]));
	const outDegree = new Map(vertices.map((vertex) => [vertex, 0]));
	for (const { first, second } of edges) {
		neighbors.get(first)?.push(second);
		neighbors.get(second)?.push(first);
		outgoing.get(first)?.push(second);
		outDegree.set(first, (outDegree.get(first) ?? 0) + 1);
		inDegree.set(second, (inDegree.get(second) ?? 0) + 1);
		degree.set(first, (degree.get(first) ?? 0) + 1);
		degree.set(second, (degree.get(second) ?? 0) + 1);
		if (!directed) {
			outgoing.get(second)?.push(first);
			outDegree.set(second, (outDegree.get(second) ?? 0) + 1);
			inDegree.set(first, (inDegree.get(first) ?? 0) + 1);
		}
	}
	for (const adjacent of neighbors.values()) adjacent.sort(compareVertices);
	for (const adjacent of outgoing.values()) adjacent.sort(compareVertices);
	const visited = new Set<Vertex>();
	const components: Vertex[][] = [];
	for (const vertex of vertices) {
		if (visited.has(vertex)) continue;
		const component: Vertex[] = [];
		const stack = [vertex];
		visited.add(vertex);
		while (stack.length) {
			const current = stack.pop();
			if (!current) continue;
			component.push(current);
			for (const next of neighbors.get(current) ?? []) {
				if (!visited.has(next)) {
					visited.add(next);
					stack.push(next);
				}
			}
		}
		components.push(component.sort(compareVertices));
	}
	const cycles: Vertex[][] = [];
	const cycleKeys = new Set<string>();
	for (const start of vertices) {
		const path = [start];
		const inPath = new Set(path);
		const walk = (current: Vertex) => {
			for (const next of outgoing.get(current) ?? []) {
				if (next === start && path.length >= (directed ? 1 : 3)) {
					if (!directed && compareVertices(path[1], path[path.length - 1]) > 0)
						continue;
					const key = JSON.stringify(path);
					if (!cycleKeys.has(key)) {
						cycleKeys.add(key);
						cycles.push([...path]);
					}
				} else if (compareVertices(next, start) > 0 && !inPath.has(next)) {
					path.push(next);
					inPath.add(next);
					walk(next);
					inPath.delete(next);
					path.pop();
				}
			}
		};
		walk(start);
	}
	return { components, cycles, degree, inDegree, outDegree };
}

function compareVertices(a: Vertex, b: Vertex) {
	return a.localeCompare(b, "fr", { numeric: true });
}

export function edgesInCycles(
	cycles: Vertex[][],
	directed = false,
): Set<string> {
	const result = new Set<string>();
	for (const cycle of cycles) {
		for (let index = 0; index < cycle.length; index++) {
			const a = cycle[index];
			const b = cycle[(index + 1) % cycle.length];
			result.add(directed ? directedEdgeKey(a, b) : edgeKey(a, b));
		}
	}
	return result;
}

export function edgeKey(a: Vertex, b: Vertex): string {
	return JSON.stringify([a, b].sort(compareVertices));
}
export function directedEdgeKey(a: Vertex, b: Vertex): string {
	return JSON.stringify([a, b]);
}
export function cycleEdges(cycle: Vertex[]): GraphEdge[] {
	return cycle.map((vertex, index) => ({
		first: vertex,
		second: cycle[(index + 1) % cycle.length],
	}));
}
