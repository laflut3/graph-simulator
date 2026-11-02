import type { Graph } from "@/lib/graph/types";

export function createGraph(): Graph {
	return {
		nom: "test",
		vertices: ["A", "B", "C", "D"],
		edges: [
			{ first: "A", second: "B" },
			{ first: "A", second: "C" },
		],
	};
}
