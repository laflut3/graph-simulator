import { edgeKey } from "@/lib/graph/analyze";
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
	return neighbors;
}

export const representationComplexity: Record<GraphRepresentation, string> = {
	"neighbor-list": "Θ(|V| + |E|)",
	"adjacency-matrix": "Θ(|V|²)",
	"edge-list": "Θ(|V| + |E|)",
};

export type GraphConstructionStep = {
	graph: Graph;
	title: string;
	description: string;
	codeLine: number;
	currentVertex?: Vertex;
	currentEdge?: Graph["edges"][number];
};

export const representationPseudocode: Record<
	GraphRepresentation,
	{ id: string; code: string }[]
> = {
	"neighbor-list": [
		{ id: "initialize", code: "G' ← (∅, ∅)" },
		{ id: "vertices-loop", code: "pour chaque sommet u de V :" },
		{ id: "add-vertex", code: "  ajouter u à G'.V" },
		{ id: "neighbors-vertices-loop", code: "pour chaque sommet u de V :" },
		{ id: "neighbors-loop", code: "  pour chaque v de voisins[u] :" },
		{ id: "deduplicate", code: "    si {u, v} n'est pas encore traité :" },
		{ id: "add-edge", code: "      ajouter {u, v} à G'.E" },
	],
	"adjacency-matrix": [
		{ id: "initialize", code: "G' ← (∅, ∅)" },
		{ id: "vertices-loop", code: "pour chaque sommet u de V :" },
		{ id: "add-vertex", code: "  ajouter u à G'.V" },
		{ id: "rows-loop", code: "pour i de 1 à |V| :" },
		{ id: "columns-loop", code: "  pour j de i + 1 à |V| :" },
		{ id: "test-edge", code: "    si A[i, j] = 1 :" },
		{ id: "add-edge", code: "      ajouter {vᵢ, vⱼ} à G'.E" },
	],
	"edge-list": [
		{ id: "initialize", code: "G' ← (∅, ∅)" },
		{ id: "vertices-loop", code: "pour chaque sommet u de V :" },
		{ id: "add-vertex", code: "  ajouter u à G'.V" },
		{ id: "edges-loop", code: "pour chaque arête {u, v} de E :" },
		{ id: "add-edge", code: "  ajouter {u, v} à G'.E" },
	],
};

export function buildGraphFromRepresentation(
	graph: Graph,
	representation: GraphRepresentation,
): GraphConstructionStep[] {
	const built: Graph = { nom: graph.nom, vertices: [], edges: [] };
	const steps: GraphConstructionStep[] = [];
	const snapshot = (): Graph => ({
		nom: built.nom,
		vertices: [...built.vertices],
		edges: [...built.edges],
	});
	const addStep = (
		title: string,
		description: string,
		currentVertex?: Vertex,
		currentEdge?: Graph["edges"][number],
		codeLine = 0,
	) => {
		steps.push({
			graph: snapshot(),
			title,
			description,
			codeLine,
			currentVertex,
			currentEdge,
		});
	};

	addStep(
		"Effacer le dessin",
		"On vide le dessin avant de reconstruire le graphe.",
	);
	for (const vertex of graph.vertices) {
		built.vertices.push(vertex);
		addStep(
			`Ajouter ${vertex}`,
			`Le sommet ${vertex} est ajouté au dessin.`,
			vertex,
			undefined,
			2,
		);
	}

	if (representation === "edge-list") {
		for (const edge of graph.edges) {
			built.edges.push(edge);
			addStep(
				`Ajouter {${edge.first}, ${edge.second}}`,
				`La paire {${edge.first}, ${edge.second}} de la liste devient une arête.`,
				edge.second,
				edge,
				4,
			);
		}
	} else if (representation === "neighbor-list") {
		const neighbors = createNeighborLists(graph);
		const seen = new Set<string>();
		for (const vertex of graph.vertices) {
			for (const neighbor of neighbors.get(vertex) ?? []) {
				const key = edgeKey(vertex, neighbor);
				if (seen.has(key)) continue;
				seen.add(key);
				const edge = { first: vertex, second: neighbor };
				built.edges.push(edge);
				addStep(
					`Relier ${vertex} à ${neighbor}`,
					`${neighbor} apparaît dans la liste de voisins de ${vertex} ; l’arête est ajoutée une seule fois.`,
					vertex,
					edge,
					6,
				);
			}
		}
	} else {
		const matrix = createAdjacencyMatrix(graph);
		for (let row = 0; row < graph.vertices.length; row++) {
			for (let column = row + 1; column < graph.vertices.length; column++) {
				const first = graph.vertices[row];
				const second = graph.vertices[column];
				if (first === undefined || second === undefined) continue;
				if (matrix[row][column] === 1) {
					const edge = { first, second };
					built.edges.push(edge);
					addStep(
						`Créer {${first}, ${second}}`,
						`A[${first}, ${second}] = 1 : on crée cette arête.`,
						second,
						edge,
						6,
					);
				} else {
					addStep(
						`Lire A[${first}, ${second}]`,
						`A[${first}, ${second}] = 0 : aucune arête à dessiner.`,
						first,
						undefined,
						5,
					);
				}
			}
		}
	}
	if (steps.length === 1)
		addStep("Graphe vide", "La représentation ne contient aucun sommet.");
	return steps;
}

export function graphRepresentationName(representation: GraphRepresentation) {
	return {
		"neighbor-list": "Listes de voisins",
		"adjacency-matrix": "Matrice d’adjacence",
		"edge-list": "Liste d’arêtes",
	}[representation];
}
