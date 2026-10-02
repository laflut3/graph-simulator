import type { Graph } from "@/lib/graph/types";

export function createGraph(): Graph {
	return {
		vertices: [1, 2, 3, 4],
		edges: [
			{ first: 1, second: 2 },
			{ first: 1, second: 3 },
		],
	};
}
