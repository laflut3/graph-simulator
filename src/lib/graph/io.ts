import type { Graph, GraphEdge, Vertex } from "@/lib/graph/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);
const normalizeName = (value: unknown): string | null =>
	typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

function parseEdge(value: unknown): GraphEdge | null {
	let endpoints: unknown[];
	let weight: unknown;
	if (Array.isArray(value) && (value.length === 2 || value.length === 3)) {
		endpoints = value.slice(0, 2);
		weight = value[2];
	} else if (isRecord(value)) {
		if (Array.isArray(value.sommets) && value.sommets.length === 2) {
			endpoints = value.sommets;
		} else {
			endpoints = [value.first, value.second];
		}
		weight = value.weight ?? value.poids;
	} else return null;
	const first = normalizeName(endpoints[0]);
	const second = normalizeName(endpoints[1]);
	if (!first || !second) return null;
	if (
		weight !== undefined &&
		(typeof weight !== "number" || !Number.isFinite(weight))
	)
		return null;
	return { first, second, ...(weight !== undefined ? { weight } : {}) };
}

/** Validate and normalize a JSON graph configuration before replacing app state. */
export function parseGraphConfig(value: unknown): Graph | null {
	if (!isRecord(value)) return null;
	const nom = normalizeName(value.nom);
	const rawVertices = Array.isArray(value.sommets)
		? value.sommets
		: isRecord(value.sommets)
			? Object.keys(value.sommets)
			: null;
	const rawEdges = value.aretes ?? value.arretes ?? value.arêtes ?? value.edges;
	if (!nom || !rawVertices || !Array.isArray(rawEdges)) return null;
	if (
		(value.oriente !== undefined && typeof value.oriente !== "boolean") ||
		(value.pondere !== undefined && typeof value.pondere !== "boolean")
	)
		return null;
	const directed = value.oriente === true;
	const weighted = value.pondere === true;
	const vertices = rawVertices.map(normalizeName);
	if (vertices.some((vertex) => vertex === null)) return null;
	const normalizedVertices = vertices as Vertex[];
	const vertexNames = new Map(
		normalizedVertices.map((vertex) => [vertex.toLocaleLowerCase(), vertex]),
	);
	if (vertexNames.size !== normalizedVertices.length) return null;
	const edges: GraphEdge[] = [];
	const edgeKeys = new Set<string>();
	for (const rawEdge of rawEdges) {
		const edge = parseEdge(rawEdge);
		if (!edge) return null;
		const first = vertexNames.get(edge.first.toLocaleLowerCase());
		const second = vertexNames.get(edge.second.toLocaleLowerCase());
		if (!first || !second || (first === second && !directed)) return null;
		const endpoints = directed
			? [first, second]
			: [first, second].sort((a, b) =>
					a.localeCompare(b, "fr", { numeric: true }),
				);
		const key = JSON.stringify(
			endpoints.map((endpoint) => endpoint.toLocaleLowerCase()),
		);
		if (edgeKeys.has(key)) return null;
		edgeKeys.add(key);
		edges.push({
			first: endpoints[0],
			second: endpoints[1],
			...(weighted ? { weight: edge.weight ?? 1 } : {}),
		});
	}
	return {
		nom,
		vertices: normalizedVertices.sort((a, b) =>
			a.localeCompare(b, "fr", { numeric: true }),
		),
		edges: edges.sort(
			(a, b) =>
				a.first.localeCompare(b.first, "fr", { numeric: true }) ||
				a.second.localeCompare(b.second, "fr", { numeric: true }),
		),
		directed,
		weighted,
	};
}

export function serializeGraphConfig(graph: Graph): string {
	return `${JSON.stringify(
		{
			nom: graph.nom,
			oriente: graph.directed,
			pondere: graph.weighted,
			sommets: graph.vertices,
			aretes: graph.edges.map(({ first, second, weight }) =>
				graph.weighted ? [first, second, weight ?? 1] : [first, second],
			),
		},
		null,
		2,
	)}\n`;
}
