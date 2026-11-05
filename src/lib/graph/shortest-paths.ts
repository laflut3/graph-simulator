import type { Graph, Vertex } from "@/lib/graph/types";

export type ShortestPathResult = {
	distance: number | null;
	path: Vertex[] | null;
	paths: Vertex[][];
	pathsTruncated: boolean;
	negativeCycle: boolean;
};

type Arc = { from: Vertex; to: Vertex; weight: number };
const MAX_SHORTEST_PATHS = 100;

function equalDistance(left: number, right: number) {
	return (
		Math.abs(left - right) <=
		1e-9 * Math.max(1, Math.abs(left), Math.abs(right))
	);
}

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
	distances.set(source, 0);

	if (!graph.weighted) {
		const queue = [source];
		for (let index = 0; index < queue.length; index++) {
			const from = queue[index];
			if (from === undefined) continue;
			for (const arc of outgoing.get(from) ?? []) {
				if (distances.get(arc.to) !== Infinity) continue;
				distances.set(arc.to, (distances.get(from) ?? 0) + 1);
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
	const predecessors = new Map<Vertex, Vertex[]>();
	for (const { from, to, weight } of arcs) {
		const fromDistance = distances.get(from) ?? Infinity;
		const toDistance = distances.get(to) ?? Infinity;
		if (
			fromDistance !== Infinity &&
			toDistance !== Infinity &&
			!negativeCycleReachable.has(from) &&
			!negativeCycleReachable.has(to) &&
			equalDistance(fromDistance + weight, toDistance)
		) {
			const previousVertices = predecessors.get(to) ?? [];
			if (!previousVertices.includes(from)) previousVertices.push(from);
			predecessors.set(to, previousVertices);
		}
	}
	const enumeratePaths = (destination: Vertex) => {
		const paths: Vertex[][] = [];
		let pathsTruncated = false;
		const reversedPath = [destination];
		const visited = new Set([destination]);
		const visit = (vertex: Vertex) => {
			if (vertex === source) {
				paths.push([...reversedPath].reverse());
				if (paths.length > MAX_SHORTEST_PATHS) pathsTruncated = true;
				return paths.length <= MAX_SHORTEST_PATHS;
			}
			for (const previous of predecessors.get(vertex) ?? []) {
				if (visited.has(previous)) continue;
				visited.add(previous);
				reversedPath.push(previous);
				const keepSearching = visit(previous);
				reversedPath.pop();
				visited.delete(previous);
				if (!keepSearching) return false;
			}
			return true;
		};
		visit(destination);
		if (pathsTruncated) paths.pop();
		return { paths, pathsTruncated };
	};
	for (const vertex of graph.vertices) {
		const negativeCycle = negativeCycleReachable.has(vertex);
		const distance = distances.get(vertex) ?? Infinity;
		if (negativeCycle || distance === Infinity) {
			results.set(vertex, {
				distance: null,
				path: null,
				paths: [],
				pathsTruncated: false,
				negativeCycle,
			});
			continue;
		}
		const { paths, pathsTruncated } = enumeratePaths(vertex);
		results.set(vertex, {
			distance,
			path: paths[0] ?? null,
			paths,
			pathsTruncated,
			negativeCycle,
		});
	}
	return results;
}
