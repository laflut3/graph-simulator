import {
	edgeKey,
	edgesInCycles,
	type GraphAnalysis,
} from "@/lib/graph/analyze";
import type { Graph, Vertex } from "@/lib/graph/types";

type Props = Graph & {
	analysis: GraphAnalysis;
	selectedVertex: Vertex | null;
	onSelectVertex: (vertex: Vertex | null) => void;
};

export function GraphVisualization({
	vertices,
	edges,
	analysis,
	selectedVertex,
	onSelectVertex,
}: Props) {
	if (!vertices.length) {
		return (
			<p className="rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
				Ajoutez des sommets pour afficher le graphe.
			</p>
		);
	}

	const radius =
		vertices.length === 1
			? 0
			: Math.max(150, Math.min(260, vertices.length * 22));
	const size = radius * 2 + 100;
	const center = size / 2;
	const point = (vertex: Vertex) => {
		const angle =
			(2 * Math.PI * vertices.indexOf(vertex)) / vertices.length - Math.PI / 2;
		return {
			x: center + radius * Math.cos(angle),
			y: center + radius * Math.sin(angle),
		};
	};
	const selectedComponent =
		analysis.components.find((component) =>
			component.includes(selectedVertex ?? ""),
		) ?? [];
	const cyclesForVertex = analysis.cycles.filter((cycle) =>
		cycle.includes(selectedVertex ?? ""),
	);
	const cycleEdges = edgesInCycles(cyclesForVertex);
	const selectedComponentSet = new Set(selectedComponent);
	const selectedCycleVertices = new Set(cyclesForVertex.flat());

	return (
		<div className="rounded-xl border border-border bg-background p-3 sm:p-6">
			<svg
				viewBox={`0 0 ${size} ${size}`}
				role="img"
				aria-label={`Graphe avec ${vertices.length} sommets et ${edges.length} arêtes`}
				className="mx-auto block aspect-square h-auto w-full max-w-2xl"
			>
				<title>Visualisation du graphe</title>
				<g strokeWidth="1.5">
					{edges.map(({ first, second }) => {
						const a = point(first);
						const b = point(second);
						const highlighted = cycleEdges.has(edgeKey(first, second));
						return (
							<line
								key={edgeKey(first, second)}
								x1={a.x}
								y1={a.y}
								x2={b.x}
								y2={b.y}
								stroke={
									highlighted ? "var(--primary)" : "var(--muted-foreground)"
								}
								strokeWidth={highlighted ? 3 : 1.5}
								opacity={selectedVertex !== null && !highlighted ? 0.22 : 0.8}
							/>
						);
					})}
				</g>
				{vertices.map((vertex) => {
					const { x, y } = point(vertex);
					const isSelected = vertex === selectedVertex;
					const isRelated =
						selectedVertex === null || selectedComponentSet.has(vertex);
					const labelWidth = Math.max(
						48,
						Math.min(112, vertex.length * 9 + 24),
					);
					return (
						// biome-ignore lint/a11y/useSemanticElements: SVG nodes need SVG-native keyboard interaction.
						<g
							key={vertex}
							role="button"
							tabIndex={0}
							aria-label={`Sommet ${vertex}, degré ${analysis.degree.get(vertex) ?? 0}`}
							aria-pressed={isSelected}
							onClick={() => onSelectVertex(isSelected ? null : vertex)}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									onSelectVertex(isSelected ? null : vertex);
								}
							}}
							className="cursor-pointer outline-none"
						>
							<rect
								x={x - labelWidth / 2}
								y={y - 22}
								width={labelWidth}
								height="44"
								rx="18"
								fill={
									selectedCycleVertices.has(vertex)
										? "var(--accent)"
										: "var(--background)"
								}
								stroke={isSelected ? "var(--primary)" : "var(--foreground)"}
								strokeWidth={isSelected ? 3 : 1.5}
								opacity={isRelated ? 1 : 0.35}
							/>
							<text
								x={x}
								y={y}
								dominantBaseline="central"
								textAnchor="middle"
								fill="var(--foreground)"
								fontFamily="var(--font-mono)"
								fontSize="13"
								textLength={Math.min(vertex.length * 8, labelWidth - 14)}
								lengthAdjust="spacingAndGlyphs"
								opacity={isRelated ? 1 : 0.35}
							>
								{vertex}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
