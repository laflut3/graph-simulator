import type { Graph, Vertex } from "@/lib/graph/types";

type GraphStructure = Pick<
	Graph,
	"vertices" | "edges" | "directed" | "weighted"
>;

export function createAdjacencyMatrix({
	vertices,
	edges,
	directed,
	weighted,
}: GraphStructure) {
	const indexes = new Map(vertices.map((vertex, index) => [vertex, index]));
	const matrix = vertices.map(() => vertices.map(() => null as number | null));
	for (const edge of edges) {
		const first = indexes.get(edge.first);
		const second = indexes.get(edge.second);
		if (first === undefined || second === undefined) continue;
		matrix[first][second] = weighted ? (edge.weight ?? 1) : 1;
		if (!directed) matrix[second][first] = weighted ? (edge.weight ?? 1) : 1;
	}
	return matrix;
}

export function createNeighborLists({
	vertices,
	edges,
	directed,
}: GraphStructure) {
	const neighbors = new Map(vertices.map((vertex) => [vertex, [] as Vertex[]]));
	for (const { first, second } of edges) {
		neighbors.get(first)?.push(second);
		if (!directed) neighbors.get(second)?.push(first);
	}
	return neighbors;
}
