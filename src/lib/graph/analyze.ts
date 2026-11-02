import type { Graph, GraphEdge, Vertex } from "@/lib/graph/types";

export type GraphAnalysis = {
	components: Vertex[][];
	cycles: Vertex[][];
	degree: Map<Vertex, number>;
};

/** Analyze a simple undirected graph, listing each simple cycle once. */
export function analyzeGraph({
	vertices,
	edges,
}: Pick<Graph, "vertices" | "edges">): GraphAnalysis {
	const neighbors = new Map(vertices.map((vertex) => [vertex, [] as Vertex[]]));
	const degree = new Map(vertices.map((vertex) => [vertex, 0]));
	for (const { first, second } of edges) {
		neighbors.get(first)?.push(second);
		neighbors.get(second)?.push(first);
		degree.set(first, (degree.get(first) ?? 0) + 1);
		degree.set(second, (degree.get(second) ?? 0) + 1);
	}
	for (const adjacent of neighbors.values())
		adjacent.sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

	const visited = new Set<Vertex>();
	const components: Vertex[][] = [];
	for (const vertex of vertices) {
		if (visited.has(vertex)) continue;
		const component: Vertex[] = [];
		const stack = [vertex];
		visited.add(vertex);
		while (stack.length) {
			const current = stack.pop();
			if (current === undefined) continue;
			component.push(current);
			for (const next of neighbors.get(current) ?? []) {
				if (!visited.has(next)) {
					visited.add(next);
					stack.push(next);
				}
			}
		}
		components.push(
			component.sort((a, b) => a.localeCompare(b, "fr", { numeric: true })),
		);
	}

	// Starting each traversal at the smallest cycle vertex and accepting only
	// one orientation avoids duplicate rotations and reverse traversals.
	const cycles: Vertex[][] = [];
	const cycleKeys = new Set<string>();
	for (const start of vertices) {
		const path = [start];
		const inPath = new Set(path);
		const walk = (current: Vertex) => {
			for (const next of neighbors.get(current) ?? []) {
				if (next === start && path.length >= 3) {
					if (
						path[1].localeCompare(path[path.length - 1], "fr", {
							numeric: true,
						}) > 0
					)
						continue;
					const key = JSON.stringify(path);
					if (!cycleKeys.has(key)) {
						cycleKeys.add(key);
						cycles.push([...path]);
					}
				} else if (
					next.localeCompare(start, "fr", { numeric: true }) > 0 &&
					!inPath.has(next)
				) {
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
	return { components, cycles, degree };
}

export function edgesInCycles(cycles: Vertex[][]): Set<string> {
	const result = new Set<string>();
	for (const cycle of cycles) {
		for (let index = 0; index < cycle.length; index++) {
			const a = cycle[index];
			const b = cycle[(index + 1) % cycle.length];
			result.add(edgeKey(a, b));
		}
	}
	return result;
}

export function edgeKey(a: Vertex, b: Vertex): string {
	return JSON.stringify(
		[a, b].sort((x, y) => x.localeCompare(y, "fr", { numeric: true })),
	);
}

export function cycleEdges(cycle: Vertex[]): GraphEdge[] {
	return cycle.map((vertex, index) => ({
		first: vertex,
		second: cycle[(index + 1) % cycle.length],
	}));
}
