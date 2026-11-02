import type { Graph, GraphEdge, Vertex } from "@/lib/graph/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeName = (value: unknown): string | null =>
	typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

function parseEdge(value: unknown): GraphEdge | null {
	let endpoints: unknown[];
	if (Array.isArray(value) && value.length === 2) {
		endpoints = value;
	} else if (isRecord(value)) {
		if (Array.isArray(value.sommets) && value.sommets.length === 2) {
			endpoints = value.sommets;
		} else {
			endpoints = [value.first, value.second];
		}
	} else {
		return null;
	}
	const first = normalizeName(endpoints[0]);
	const second = normalizeName(endpoints[1]);
	return first && second ? { first, second } : null;
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
		if (!edge) {
			return null;
		}
		const first = vertexNames.get(edge.first.toLocaleLowerCase());
		const second = vertexNames.get(edge.second.toLocaleLowerCase());
		if (!first || !second || first === second) return null;
		const endpoints = [first, second].sort((a, b) =>
			a.localeCompare(b, "fr", { numeric: true }),
		);
		const key = JSON.stringify(
			endpoints.map((endpoint) => endpoint.toLocaleLowerCase()),
		);
		if (edgeKeys.has(key)) return null;
		edgeKeys.add(key);
		edges.push({ first: endpoints[0], second: endpoints[1] });
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
	};
}

export function serializeGraphConfig(graph: Graph): string {
	return `${JSON.stringify(
		{
			nom: graph.nom,
			sommets: graph.vertices,
			aretes: graph.edges.map(({ first, second }) => [first, second]),
		},
		null,
		2,
	)}\n`;
}
