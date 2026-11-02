export type Vertex = string;
export type GraphEdge = { first: Vertex; second: Vertex; weight?: number };
export type Graph = {
	nom: string;
	vertices: Vertex[];
	edges: GraphEdge[];
	directed: boolean;
	weighted: boolean;
};
export type GraphError =
	| "invalid-vertex"
	| "duplicate-vertex"
	| "invalid-edge"
	| "invalid-weight"
	| "duplicate-edge";
export type GraphUpdate = { graph: Graph; error: GraphError | null };
