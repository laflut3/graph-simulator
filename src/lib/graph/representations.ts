import type { Graph, Vertex } from "@/lib/graph/types";

export type GraphRepresentation =
	| "neighbor-list"
	| "adjacency-matrix"
	| "edge-list";
type GraphStructure = Pick<Graph, "vertices" | "edges">;

export function createAdjacencyMatrix({ vertices, edges }: GraphStructure) {
	const indexes = new Map(vertices.map((vertex, index) => [vertex, index]));
	const matrix = vertices.map(() => vertices.map(() => 0));
	for (const { first, second } of edges) {
		const firstIndex = indexes.get(first);
		const secondIndex = indexes.get(second);
		if (firstIndex === undefined || secondIndex === undefined) continue;
		matrix[firstIndex][secondIndex] = 1;
		matrix[secondIndex][firstIndex] = 1;
	}
	return matrix;
}

export function createNeighborLists({ vertices, edges }: GraphStructure) {
	const neighbors = new Map(vertices.map((vertex) => [vertex, [] as Vertex[]]));
	for (const { first, second } of edges) {
		neighbors.get(first)?.push(second);
		neighbors.get(second)?.push(first);
	}
	for (const adjacent of neighbors.values())
		adjacent.sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
	return neighbors;
}

export const representationComplexity: Record<
	GraphRepresentation,
	{
		space: string;
		testAdjacency: string;
		listNeighbors: string;
		listEdges: string;
	}
> = {
	"neighbor-list": {
		space: "Θ(|V| + |E|)",
		testAdjacency: "O(deg(u))",
		listNeighbors: "Θ(deg(u))",
		listEdges: "Θ(|V| + |E|)",
	},
	"adjacency-matrix": {
		space: "Θ(|V|²)",
		testAdjacency: "O(1)",
		listNeighbors: "Θ(|V|)",
		listEdges: "Θ(|V|²)",
	},
	"edge-list": {
		space: "Θ(|E|)",
		testAdjacency: "O(|E|)",
		listNeighbors: "O(|E|)",
		listEdges: "Θ(|E|)",
	},
};

export function graphRepresentationName(representation: GraphRepresentation) {
	return {
		"neighbor-list": "Listes de voisins",
		"adjacency-matrix": "Matrice d’adjacence",
		"edge-list": "Liste d’arêtes",
	}[representation];
}
