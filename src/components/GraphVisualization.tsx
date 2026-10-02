import type { GraphEdge } from "@/types/graph";

type GraphVisualizationProps = {
	vertices: number[];
	edges: GraphEdge[];
};

export function GraphVisualization({
	vertices,
	edges,
}: GraphVisualizationProps) {
	if (!vertices.length) {
		return (
			<p className="py-12 text-center text-sm text-muted-foreground">
				Ajoutez des sommets pour afficher le graphe.
			</p>
		);
	}

	const radius =
		vertices.length === 1
			? 0
			: Math.max(120, Math.min(220, vertices.length * 18));
	const size = radius * 2 + 88;
	const center = size / 2;
	const point = (vertex: number) => {
		const angle =
			(2 * Math.PI * vertices.indexOf(vertex)) / vertices.length - Math.PI / 2;
		return {
			x: center + radius * Math.cos(angle),
			y: center + radius * Math.sin(angle),
		};
	};

	return (
		<svg
			viewBox={`0 0 ${size} ${size}`}
			role="img"
			aria-label={`Graphe avec ${vertices.length} sommets et ${edges.length} arêtes`}
			className="mx-auto block aspect-square h-auto w-full max-w-md"
		>
			<title>Visualisation du graphe</title>
			<g stroke="var(--muted-foreground)" strokeWidth="1.5">
				{edges.map(({ first, second }) => {
					const a = point(first);
					const b = point(second);
					return (
						<line
							key={`${first}:${second}`}
							x1={a.x}
							y1={a.y}
							x2={b.x}
							y2={b.y}
						/>
					);
				})}
			</g>
			{vertices.map((vertex) => {
				const { x, y } = point(vertex);
				return (
					<g key={vertex}>
						<circle
							cx={x}
							cy={y}
							r="21"
							fill="var(--background)"
							stroke="var(--foreground)"
							strokeWidth="1.5"
						/>
						<text
							x={x}
							y={y}
							dominantBaseline="central"
							textAnchor="middle"
							fill="var(--foreground)"
							fontFamily="var(--font-mono)"
							fontSize="13"
						>
							{vertex}
						</text>
					</g>
				);
			})}
		</svg>
	);
}
