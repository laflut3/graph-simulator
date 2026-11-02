import type { Graph } from "@/lib/graph/types";
import type { Language } from "@/lib/i18n";
import { buildFromAdjacencyMatrix } from "./execution/adjacency-matrix";
import { buildFromEdgeList } from "./execution/edge-list";
import { buildFromNeighborList } from "./execution/neighbor-list";
import { graphRepresentationName, representationComplexity } from "./metadata";
import { getRepresentationPseudocode } from "./pseudocode";
import { createAdjacencyMatrix, createNeighborLists } from "./structures";
import type { GraphConstructionStep, GraphRepresentation } from "./types";

export {
	createAdjacencyMatrix,
	createNeighborLists,
	getRepresentationPseudocode,
	graphRepresentationName,
	representationComplexity,
};
export type { GraphConstructionStep, GraphRepresentation };

export function buildGraphFromRepresentation(
	graph: Graph,
	representation: GraphRepresentation,
	language: Language = "en",
): GraphConstructionStep[] {
	if (representation === "edge-list") return buildFromEdgeList(graph, language);
	if (representation === "adjacency-matrix")
		return buildFromAdjacencyMatrix(graph, language);
	return buildFromNeighborList(graph, language);
}
