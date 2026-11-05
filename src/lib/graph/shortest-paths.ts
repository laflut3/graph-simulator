import type { Graph, Vertex } from "@/lib/graph/types";

export type ShortestPathResult = {
	distance: number | null;
	path: Vertex[] | null;
	negativeCycle: boolean;
};

type Arc = { from: Vertex; to: Vertex; weight: number };

/** Find shortest paths from one vertex using BFS or Bellman-Ford. */
export function findShortestPaths(
	graph: Graph,
	source: Vertex,
): Map<Vertex, ShortestPathResult> {
	const outgoing = new Map(
		graph.vertices.map((vertex) => [vertex, [] as Arc[]]),
	);
	const arcs: Arc[] = [];
	for (const edge of graph.edges) {
		const arc = {
			from: edge.first,
			to: edge.second,
			weight: graph.weighted ? (edge.weight ?? 1) : 1,
		};
		arcs.push(arc);
		outgoing.get(arc.from)?.push(arc);
		if (!graph.directed) {
			const reverse = { ...arc, from: arc.to, to: arc.from };
			arcs.push(reverse);
			outgoing.get(reverse.from)?.push(reverse);
		}
	}

	const distances = new Map(graph.vertices.map((vertex) => [vertex, Infinity]));
	const previous = new Map<Vertex, Vertex>();
	distances.set(source, 0);

	if (!graph.weighted) {
		const queue = [source];
		for (let index = 0; index < queue.length; index++) {
			const from = queue[index];
			if (from === undefined) continue;
			for (const arc of outgoing.get(from) ?? []) {
				if (distances.get(arc.to) !== Infinity) continue;
				distances.set(arc.to, (distances.get(from) ?? 0) + 1);
				previous.set(arc.to, from);
				queue.push(arc.to);
			}
		}
	} else {
		for (let pass = 1; pass < graph.vertices.length; pass++) {
			let changed = false;
			for (const { from, to, weight } of arcs) {
				const fromDistance = distances.get(from) ?? Infinity;
				if (fromDistance === Infinity) continue;
				const candidate = fromDistance + weight;
				if (candidate >= (distances.get(to) ?? Infinity)) continue;
				distances.set(to, candidate);
				previous.set(to, from);
				changed = true;
			}
			if (!changed) break;
		}
	}

	const negativeCycleReachable = new Set<Vertex>();
	if (graph.weighted) {
		const queue: Vertex[] = [];
		for (const { from, to, weight } of arcs) {
			const fromDistance = distances.get(from) ?? Infinity;
			if (
				fromDistance !== Infinity &&
				fromDistance + weight < (distances.get(to) ?? Infinity)
			) {
				if (!negativeCycleReachable.has(to)) {
					negativeCycleReachable.add(to);
					queue.push(to);
				}
			}
		}
		for (let index = 0; index < queue.length; index++) {
			const from = queue[index];
			if (from === undefined) continue;
			for (const { to } of outgoing.get(from) ?? []) {
				if (negativeCycleReachable.has(to)) continue;
				negativeCycleReachable.add(to);
				queue.push(to);
			}
		}
	}

	const results = new Map<Vertex, ShortestPathResult>();
	for (const vertex of graph.vertices) {
		const negativeCycle = negativeCycleReachable.has(vertex);
		const distance = distances.get(vertex) ?? Infinity;
		if (negativeCycle || distance === Infinity) {
			results.set(vertex, { distance: null, path: null, negativeCycle });
			continue;
		}
		const path = [vertex];
		let current = vertex;
		while (current !== source) {
			const parent = previous.get(current);
			if (parent === undefined) break;
			path.unshift(parent);
			current = parent;
		}
		results.set(vertex, { distance, path, negativeCycle });
	}
	return results;
}
