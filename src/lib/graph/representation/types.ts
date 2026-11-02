import type { Graph, Vertex } from "@/lib/graph/types";

export type GraphRepresentation =
	| "neighbor-list"
	| "adjacency-matrix"
	| "edge-list";
export type GraphConstructionStep = {
	graph: Graph;
	title: string;
	codeLine: number;
	currentVertex?: Vertex;
	currentEdge?: Graph["edges"][number];
};
