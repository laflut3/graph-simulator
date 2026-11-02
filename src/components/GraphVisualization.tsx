import {
	edgeKey,
	edgesInCycles,
	type GraphAnalysis,
} from "@/lib/graph/analyze";
import type { Graph, Vertex } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type Props = Graph & {
	analysis: GraphAnalysis;
	selectedVertex: Vertex | null;
	onSelectVertex: (vertex: Vertex | null) => void;
	layoutVertices?: Vertex[];
	showEmptyCanvas?: boolean;
	interactive?: boolean;
	currentVertex?: Vertex;
	currentEdge?: Graph["edges"][number];
};

export function GraphVisualization({
	vertices,
	edges,
	analysis,
	selectedVertex,
	onSelectVertex,
	layoutVertices,
	showEmptyCanvas = false,
	interactive = true,
	currentVertex,
	currentEdge,
}: Props) {
	const [language] = useLanguage();
	if (!vertices.length && !showEmptyCanvas) {
		return (
			<p className="rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
				{text(
					language,
					"Add vertices to see the graph.",
					"Ajoutez des sommets pour afficher le graphe.",
				)}
			</p>
		);
	}

	const positions = layoutVertices ?? vertices;
	const radius =
		positions.length <= 1
			? 0
			: Math.max(150, Math.min(260, positions.length * 22));
	const size = radius * 2 + 100;
	const center = size / 2;
	const point = (vertex: Vertex) => {
		const angle =
			(2 * Math.PI * positions.indexOf(vertex)) / positions.length -
			Math.PI / 2;
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
				aria-label={text(
					language,
					`Graph with ${vertices.length} vertices and ${edges.length} edges`,
					`Graphe avec ${vertices.length} sommets et ${edges.length} arêtes`,
				)}
				className="mx-auto block aspect-square h-auto w-full max-w-2xl"
			>
				<title>
					{text(language, "Graph visualization", "Visualisation du graphe")}
				</title>
				<g strokeWidth="1.5">
					{edges.map(({ first, second }) => {
						const a = point(first);
						const b = point(second);
						const key = edgeKey(first, second);
						const isCurrent = currentEdge
							? key === edgeKey(currentEdge.first, currentEdge.second)
							: false;
						const highlighted = isCurrent || cycleEdges.has(key);
						return (
							<line
								key={edgeKey(first, second)}
								x1={a.x}
								y1={a.y}
								x2={b.x}
								y2={b.y}
								stroke={
									isCurrent
										? "var(--construction-active)"
										: cycleEdges.has(key)
											? "var(--primary)"
											: "var(--muted-foreground)"
								}
								strokeWidth={isCurrent ? 4 : highlighted ? 3 : 1.5}
								opacity={
									isCurrent
										? 1
										: selectedVertex !== null && !highlighted
											? 0.22
											: 0.8
								}
							/>
						);
					})}
				</g>
				{vertices.map((vertex) => {
					const { x, y } = point(vertex);
					const isSelected = vertex === selectedVertex;
					const isCurrent = vertex === currentVertex;
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
							tabIndex={interactive ? 0 : -1}
							aria-disabled={!interactive}
							aria-label={text(
								language,
								`Vertex ${vertex}, degree ${analysis.degree.get(vertex) ?? 0}`,
								`Sommet ${vertex}, degré ${analysis.degree.get(vertex) ?? 0}`,
							)}
							aria-pressed={isSelected}
							onClick={
								interactive
									? () => onSelectVertex(isSelected ? null : vertex)
									: undefined
							}
							onKeyDown={(event) => {
								if (
									interactive &&
									(event.key === "Enter" || event.key === " ")
								) {
									event.preventDefault();
									onSelectVertex(isSelected ? null : vertex);
								}
							}}
							className={
								interactive ? "cursor-pointer outline-none" : "outline-none"
							}
						>
							<rect
								x={x - labelWidth / 2}
								y={y - 22}
								width={labelWidth}
								height="44"
								rx="18"
								fill={
									isCurrent
										? "var(--construction-active)"
										: selectedCycleVertices.has(vertex)
											? "var(--accent)"
											: "var(--background)"
								}
								stroke={
									isCurrent
										? "var(--construction-active)"
										: isSelected
											? "var(--primary)"
											: "var(--foreground)"
								}
								strokeWidth={isSelected || isCurrent ? 3 : 1.5}
								opacity={isRelated ? 1 : 0.35}
							/>
							<text
								x={x}
								y={y}
								dominantBaseline="central"
								textAnchor="middle"
								fill={
									isCurrent
										? "var(--construction-active-foreground)"
										: "var(--foreground)"
								}
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
