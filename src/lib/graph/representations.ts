import { directedEdgeKey, edgeKey } from "@/lib/graph/analyze";
import type { Graph, Vertex } from "@/lib/graph/types";
import type { Language } from "@/lib/i18n";

export type GraphRepresentation =
	| "neighbor-list"
	| "adjacency-matrix"
	| "edge-list";
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
	const matrix: (number | null)[][] = vertices.map(() =>
		vertices.map(() => null),
	);
	for (const edge of edges) {
		const { first, second } = edge;
		const firstIndex = indexes.get(first);
		const secondIndex = indexes.get(second);
		if (firstIndex === undefined || secondIndex === undefined) continue;
		matrix[firstIndex][secondIndex] = weighted ? (edge.weight ?? 1) : 1;
		if (!directed)
			matrix[secondIndex][firstIndex] = weighted ? (edge.weight ?? 1) : 1;
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

export const representationComplexity: Record<GraphRepresentation, string> = {
	"neighbor-list": "Θ(|V| + |E|)",
	"adjacency-matrix": "Θ(|V|²)",
	"edge-list": "Θ(|V| + |E|)",
};

export type GraphConstructionStep = {
	graph: Graph;
	title: string;
	codeLine: number;
	currentVertex?: Vertex;
	currentEdge?: Graph["edges"][number];
};

export const representationPseudocode: Record<
	Language,
	Record<GraphRepresentation, { id: string; code: string }[]>
> = {
	en: {
		"neighbor-list": [
			{ id: "initialize", code: "G' ← (∅, ∅)" },
			{ id: "vertices-loop", code: "for each vertex u in V:" },
			{ id: "add-vertex", code: "  add u to G'.V" },
			{ id: "neighbors-vertices-loop", code: "for each vertex u in V:" },
			{ id: "neighbors-loop", code: "  for each v in neighbors[u]:" },
			{ id: "deduplicate", code: "    if {u, v} is not processed:" },
			{ id: "add-edge", code: "      add {u, v} to G'.E" },
		],
		"adjacency-matrix": [
			{ id: "initialize", code: "G' ← (∅, ∅)" },
			{ id: "vertices-loop", code: "for each vertex u in V:" },
			{ id: "add-vertex", code: "  add u to G'.V" },
			{ id: "rows-loop", code: "for i from 1 to |V|:" },
			{ id: "columns-loop", code: "  for j from i + 1 to |V|:" },
			{ id: "test-edge", code: "    if A[i, j] = 1:" },
			{ id: "add-edge", code: "      add {vᵢ, vⱼ} to G'.E" },
		],
		"edge-list": [
			{ id: "initialize", code: "G' ← (∅, ∅)" },
			{ id: "vertices-loop", code: "for each vertex u in V:" },
			{ id: "add-vertex", code: "  add u to G'.V" },
			{ id: "edges-loop", code: "for each edge {u, v} in E:" },
			{ id: "add-edge", code: "  add {u, v} to G'.E" },
		],
	},
	fr: {
		"neighbor-list": [
			{ id: "initialize", code: "G' ← (∅, ∅)" },
			{ id: "vertices-loop", code: "pour chaque sommet u de V :" },
			{ id: "add-vertex", code: "  ajouter u à G'.V" },
			{ id: "neighbors-vertices-loop", code: "pour chaque sommet u de V :" },
			{ id: "neighbors-loop", code: "  pour chaque v de voisins[u] :" },
			{ id: "deduplicate", code: "    si {u, v} n'est pas traité :" },
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
	},
};

export function buildGraphFromRepresentation(
	graph: Graph,
	representation: GraphRepresentation,
	language: Language = "en",
): GraphConstructionStep[] {
	const built: Graph = {
		nom: graph.nom,
		vertices: [],
		edges: [],
		directed: graph.directed,
		weighted: graph.weighted,
	};
	const steps: GraphConstructionStep[] = [];
	const snapshot = (): Graph => ({
		nom: built.nom,
		vertices: [...built.vertices],
		edges: [...built.edges],
		directed: built.directed,
		weighted: built.weighted,
	});
	const addStep = (
		title: string,
		codeLine = 0,
		currentVertex?: Vertex,
		currentEdge?: Graph["edges"][number],
	) => {
		steps.push({
			graph: snapshot(),
			title,
			codeLine,
			currentVertex,
			currentEdge,
		});
	};

	const en = language === "en";
	const edgeDescription = (edge: Graph["edges"][number]) => {
		const endpoints = graph.directed
			? `${edge.first} → ${edge.second}`
			: `{${edge.first}, ${edge.second}}`;
		return graph.weighted ? `${endpoints} : ${edge.weight ?? 1}` : endpoints;
	};
	addStep(en ? "Initialize empty graph" : "Initialiser le graphe vide", 0);
	for (const vertex of graph.vertices) {
		addStep(
			en
				? `Check vertex loop: ${vertex} is next`
				: `Tester la boucle des sommets : ${vertex} est suivant`,
			1,
			vertex,
		);
		built.vertices.push(vertex);
		addStep(
			en ? `Add vertex ${vertex}` : `Ajouter le sommet ${vertex}`,
			2,
			vertex,
		);
		addStep(
			en ? "Return to vertex loop" : "Retour à la boucle des sommets",
			1,
			vertex,
		);
	}
	addStep(
		en
			? "Check vertex loop: no vertices left"
			: "Tester la boucle des sommets : aucun sommet restant",
		1,
	);

	if (representation === "edge-list") {
		for (const edge of graph.edges) {
			addStep(
				en
					? `Check edge loop: ${edgeDescription(edge)} is next`
					: `Tester la boucle des arêtes : ${edgeDescription(edge)} est suivante`,
				3,
				edge.first,
				edge,
			);
			built.edges.push(edge);
			addStep(
				en
					? `Add edge ${edgeDescription(edge)}`
					: `Ajouter l’arête ${edgeDescription(edge)}`,
				4,
				edge.second,
				edge,
			);
			addStep(
				en ? "Return to edge loop" : "Retour à la boucle des arêtes",
				3,
				edge.first,
				edge,
			);
		}
		addStep(
			en
				? "Check edge loop: no edges left"
				: "Tester la boucle des arêtes : aucune arête restante",
			3,
		);
	} else if (representation === "neighbor-list") {
		const neighbors = createNeighborLists(graph);
		const seen = new Set<string>();
		for (const vertex of graph.vertices) {
			addStep(
				en
					? `Check vertex loop: u = ${vertex}`
					: `Tester la boucle des sommets : u = ${vertex}`,
				3,
				vertex,
			);
			for (const neighbor of neighbors.get(vertex) ?? []) {
				addStep(
					en
						? `Check neighbor loop: v = ${neighbor}`
						: `Tester la boucle des voisins : v = ${neighbor}`,
					4,
					vertex,
					{ first: vertex, second: neighbor },
				);
				const key = graph.directed
					? directedEdgeKey(vertex, neighbor)
					: edgeKey(vertex, neighbor);
				if (seen.has(key)) {
					addStep(
						en
							? `Condition false: {${vertex}, ${neighbor}} was already added; skip`
							: `Condition fausse : {${vertex}, ${neighbor}} existe déjà ; ignorer`,
						5,
						vertex,
						{ first: vertex, second: neighbor },
					);
				} else {
					seen.add(key);
					addStep(
						en
							? `Condition true: {${vertex}, ${neighbor}} is new`
							: `Condition vraie : {${vertex}, ${neighbor}} est nouvelle`,
						5,
						vertex,
						{ first: vertex, second: neighbor },
					);
					const original = graph.edges.find((item) =>
						graph.directed
							? item.first === vertex && item.second === neighbor
							: edgeKey(item.first, item.second) === edgeKey(vertex, neighbor),
					);
					const edge = {
						first: vertex,
						second: neighbor,
						...(graph.weighted ? { weight: original?.weight ?? 1 } : {}),
					};
					built.edges.push(edge);
					addStep(
						en
							? `Add edge ${edgeDescription(edge)}`
							: `Ajouter l’arête ${edgeDescription(edge)}`,
						6,
						vertex,
						edge,
					);
				}
				addStep(
					en
						? `Return to neighbor loop for u = ${vertex}`
						: `Retour à la boucle des voisins pour u = ${vertex}`,
					4,
					vertex,
					{ first: vertex, second: neighbor },
				);
			}
			addStep(
				en
					? `Return to neighbor loop for u = ${vertex}: no neighbors left`
					: `Retour à la boucle des voisins pour u = ${vertex} : aucun voisin restant`,
				4,
				vertex,
			);
			addStep(
				en ? "Return to vertex loop" : "Retour à la boucle des sommets",
				3,
				vertex,
			);
		}
		addStep(
			en
				? "Check vertex loop: no vertices left"
				: "Tester la boucle des sommets : aucun sommet restant",
			3,
		);
	} else {
		const matrix = createAdjacencyMatrix(graph);
		for (let row = 0; row < graph.vertices.length; row++) {
			const first = graph.vertices[row];
			if (first === undefined) continue;
			addStep(
				en
					? `Check row loop: i = ${row + 1}`
					: `Tester la boucle des lignes : i = ${row + 1}`,
				3,
				first,
			);
			for (
				let column = graph.directed ? 0 : row + 1;
				column < graph.vertices.length;
				column++
			) {
				if (column === row && !graph.directed) continue;
				const second = graph.vertices[column];
				if (second === undefined) continue;
				addStep(
					en
						? `Check column loop: j = ${column + 1}`
						: `Tester la boucle des colonnes : j = ${column + 1}`,
					4,
					first,
					{ first, second },
				);
				if (matrix[row][column] !== null) {
					addStep(
						en
							? `Condition true: A[${first}, ${second}] = ${matrix[row][column]}`
							: `Condition vraie : A[${first}, ${second}] = ${matrix[row][column]}`,
						5,
						first,
						{ first, second },
					);
					const edge = {
						first,
						second,
						...(graph.weighted ? { weight: matrix[row][column] ?? 1 } : {}),
					};
					built.edges.push(edge);
					addStep(
						en
							? `Add edge ${edgeDescription(edge)}`
							: `Ajouter l’arête ${edgeDescription(edge)}`,
						6,
						second,
						edge,
					);
				} else {
					const emptyCell = graph.weighted ? "∞" : "0";
					addStep(
						en
							? `Condition false: A[${first}, ${second}] = ${emptyCell}; skip`
							: `Condition fausse : A[${first}, ${second}] = ${emptyCell} ; ignorer`,
						5,
						first,
						{ first, second },
					);
				}
				addStep(
					en
						? `Return to column loop for i = ${row + 1}`
						: `Retour à la boucle des colonnes pour i = ${row + 1}`,
					4,
					first,
				);
			}
			addStep(
				en
					? `Return to column loop for i = ${row + 1}: no columns left`
					: `Retour à la boucle des colonnes pour i = ${row + 1} : aucune colonne restante`,
				4,
				first,
			);
			addStep(
				en ? "Return to row loop" : "Retour à la boucle des lignes",
				3,
				first,
			);
		}
		addStep(
			en
				? "Check row loop: no rows left"
				: "Tester la boucle des lignes : aucune ligne restante",
			3,
		);
	}
	if (steps.length === 2)
		addStep(en ? "Graph is empty" : "Le graphe est vide", 0);
	return steps;
}

export function graphRepresentationName(
	representation: GraphRepresentation,
	language: Language = "en",
) {
	const names = {
		en: {
			"neighbor-list": "Neighbor lists",
			"adjacency-matrix": "Adjacency matrix",
			"edge-list": "Edge list",
		},
		fr: {
			"neighbor-list": "Listes de voisins",
			"adjacency-matrix": "Matrice d’adjacence",
			"edge-list": "Liste d’arêtes",
		},
	};
	return names[language][representation];
}
