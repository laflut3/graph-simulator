import {
	directedEdgeKey,
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
	directed,
	weighted,
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
	const size =
		radius * 2 +
		100 +
		(edges.some((edge) => edge.first === edge.second) ? 90 : 0);
	const center = size / 2;
	const point = (vertex: Vertex) => {
		if (positions.length <= 1) return { x: center, y: center };
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
	const cycleEdges = edgesInCycles(cyclesForVertex, directed);
	const selectedComponentSet = new Set(selectedComponent);
	const selectedCycleVertices = new Set(cyclesForVertex.flat());

	return (
		<div className="overflow-x-auto rounded-xl border border-border bg-background p-3 sm:p-6">
			<svg
				viewBox={`0 0 ${size} ${size}`}
				role="img"
				aria-label={text(
					language,
					`Graph with ${vertices.length} vertices and ${edges.length} edges`,
					`Graphe avec ${vertices.length} sommets et ${edges.length} arêtes`,
				)}
				className={`mx-auto block aspect-square h-auto w-full max-w-2xl ${vertices.length > 8 ? "max-sm:min-w-[28rem]" : ""}`}
			>
				<title>
					{text(language, "Graph visualization", "Visualisation du graphe")}
				</title>
				<defs>
					<marker
						id="graph-arrow"
						viewBox="0 0 10 10"
						refX="8"
						refY="5"
						markerWidth="6"
						markerHeight="6"
						orient="auto-start-reverse"
					>
						<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
					</marker>
					<marker
						id="graph-arrow-active"
						viewBox="0 0 10 10"
						refX="8"
						refY="5"
						markerWidth="6"
						markerHeight="6"
						orient="auto-start-reverse"
					>
						<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--construction-active)" />
					</marker>
					<marker
						id="graph-arrow-cycle"
						viewBox="0 0 10 10"
						refX="8"
						refY="5"
						markerWidth="6"
						markerHeight="6"
						orient="auto-start-reverse"
					>
						<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
					</marker>
				</defs>
				<g strokeWidth="1.5">
					{edges.map(({ first, second, weight }) => {
						const a = point(first);
						const b = point(second);
						const isLoop = first === second;
						const dx = b.x - a.x;
						const dy = b.y - a.y;
						const firstWidth = Math.max(
							48,
							Math.min(112, first.length * 9 + 24),
						);
						const secondWidth = Math.max(
							48,
							Math.min(112, second.length * 9 + 24),
						);
						const sourceScale =
							1 / Math.max(Math.abs(dx) / (firstWidth / 2), Math.abs(dy) / 22);
						const targetScale =
							1 /
							Math.max(
								Math.abs(dx) / (secondWidth / 2 + (directed ? 9 : 0)),
								Math.abs(dy) / (22 + (directed ? 9 : 0)),
							);
						const key = directed
							? directedEdgeKey(first, second)
							: edgeKey(first, second);
						const isCurrent = currentEdge
							? key ===
								(directed
									? directedEdgeKey(currentEdge.first, currentEdge.second)
									: edgeKey(currentEdge.first, currentEdge.second))
							: false;
						const highlighted = isCurrent || cycleEdges.has(key);
						const hasReverseArc =
							directed &&
							edges.some(
								(edge) => edge.first === second && edge.second === first,
							);
						const length = Math.hypot(dx, dy) || 1;
						const normalX = -dy / length;
						const normalY = dx / length;
						const curveOffset = hasReverseArc ? 15 : 0;
						const startX = isLoop
							? a.x - 16
							: a.x + dx * sourceScale + normalX * curveOffset * 0.5;
						const startY = isLoop
							? a.y - 24
							: a.y + dy * sourceScale + normalY * curveOffset * 0.5;
						const endX = isLoop
							? b.x + 16
							: b.x - dx * targetScale + normalX * curveOffset * 0.5;
						const endY = isLoop
							? b.y - 24
							: b.y - dy * targetScale + normalY * curveOffset * 0.5;
						const controlX = (startX + endX) / 2 + normalX * curveOffset * 2;
						const controlY = (startY + endY) / 2 + normalY * curveOffset * 2;
						const labelX = isLoop
							? a.x
							: (startX + endX) / 2 + normalX * curveOffset;
						const labelY = isLoop
							? a.y - 58
							: (startY + endY) / 2 + normalY * curveOffset;
						const stroke = isCurrent
							? "var(--construction-active)"
							: cycleEdges.has(key)
								? "var(--primary)"
								: "var(--muted-foreground)";
						return (
							<g key={key}>
								<path
									fill="none"
									d={
										isLoop
											? `M ${startX} ${startY} C ${a.x - 44} ${a.y - 70} ${a.x + 44} ${a.y - 70} ${endX} ${endY}`
											: hasReverseArc
												? `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
												: `M ${startX} ${startY} L ${endX} ${endY}`
									}
									stroke={stroke}
									strokeWidth={isCurrent ? 4 : highlighted ? 3 : 1.5}
									opacity={
										isCurrent
											? 1
											: selectedVertex !== null && !highlighted
												? 0.22
												: 0.8
									}
									{...(directed
										? {
												markerEnd: `url(#${isCurrent ? "graph-arrow-active" : cycleEdges.has(key) ? "graph-arrow-cycle" : "graph-arrow"})`,
											}
										: {})}
								/>
								{weighted && (
									<g>
										<rect
											x={labelX - 15}
											y={labelY - 10}
											width="30"
											height="20"
											rx="6"
											fill="var(--background)"
											stroke="var(--border)"
										/>
										<text
											x={labelX}
											y={labelY}
											textAnchor="middle"
											dominantBaseline="central"
											fill={
												isCurrent
													? "var(--construction-active)"
													: "var(--foreground)"
											}
											fontSize="11"
											fontFamily="var(--font-mono)"
										>
											{weight ?? 1}
										</text>
									</g>
								)}
							</g>
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
								directed
									? `Vertex ${vertex}, in-degree ${analysis.inDegree.get(vertex) ?? 0}, out-degree ${analysis.outDegree.get(vertex) ?? 0}`
									: `Vertex ${vertex}, degree ${analysis.degree.get(vertex) ?? 0}`,
								directed
									? `Sommet ${vertex}, degré entrant ${analysis.inDegree.get(vertex) ?? 0}, degré sortant ${analysis.outDegree.get(vertex) ?? 0}`
									: `Sommet ${vertex}, degré ${analysis.degree.get(vertex) ?? 0}`,
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
