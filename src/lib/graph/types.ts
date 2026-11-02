export type Vertex = string;
export type GraphEdge = { first: Vertex; second: Vertex };
export type Graph = { nom: string; vertices: Vertex[]; edges: GraphEdge[] };
export type GraphError =
	| "invalid-vertex"
	| "duplicate-vertex"
	| "invalid-edge"
	| "duplicate-edge";
export type GraphUpdate = { graph: Graph; error: GraphError | null };
