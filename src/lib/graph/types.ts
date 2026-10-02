export type GraphEdge = { first: number; second: number };
export type Graph = { vertices: number[]; edges: GraphEdge[] };
export type GraphError =
	| "invalid-vertex"
	| "duplicate-vertex"
	| "invalid-edge"
	| "duplicate-edge";
export type GraphUpdate = { graph: Graph; error: GraphError | null };
