type Edge = {
	first: number;
	second: number;
};

type Point = {
	x: number;
	y: number;
};

type GraphVisualizationProps = {
	vertices: number[];
	edges: Edge[];
};

function edgeKey(first: number, second: number) {
	return [first, second].sort((a, b) => a - b).join(":");
}

function GraphVisualization({ vertices, edges }: GraphVisualizationProps) {
	if (vertices.length === 0) {
		return (
			<section
				aria-labelledby="graph-title"
				className="mt-16 border-t border-border pt-8"
			>
				<h2 id="graph-title" className="text-sm font-medium">
					Graphe
				</h2>
				<p className="mt-10 py-12 text-center text-sm text-muted-foreground">
					Ajoutez des sommets pour afficher le graphe.
				</p>
			</section>
		);
	}

	const radius =
		vertices.length === 1
			? 0
			: Math.max(120, Math.min(220, vertices.length * 18));
	const padding = 44;
	const size = radius * 2 + padding * 2;
	const center = size / 2;
	const positions = new Map<number, Point>();

	vertices.forEach((vertex, index) => {
		const angle = (2 * Math.PI * index) / vertices.length - Math.PI / 2;
		positions.set(vertex, {
			x: center + radius * Math.cos(angle),
			y: center + radius * Math.sin(angle),
		});
	});

	return (
		<section
			aria-labelledby="graph-title"
			className="mt-16 border-t border-border pt-8"
		>
			<div className="mb-4 flex items-baseline justify-between gap-4">
				<h2 id="graph-title" className="text-sm font-medium">
					Graphe
				</h2>
				<span className="text-xs text-muted-foreground">
					{vertices.length} sommets · {edges.length} arêtes
				</span>
			</div>

			<svg
				viewBox={`0 0 ${size} ${size}`}
				role="img"
				aria-label={`Graphe non orienté avec ${vertices.length} sommets et ${edges.length} arêtes`}
				className="mx-auto block aspect-square h-auto w-full max-w-md"
				preserveAspectRatio="xMidYMid meet"
			>
				<title>Visualisation du graphe G</title>
				<g stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.65">
					{edges.map((edge) => {
						const first = positions.get(edge.first);
						const second = positions.get(edge.second);

						if (!first || !second) return null;

						return (
							<line
								key={edgeKey(edge.first, edge.second)}
								x1={first.x}
								y1={first.y}
								x2={second.x}
								y2={second.y}
							/>
						);
					})}
				</g>
				<g>
					{vertices.map((vertex) => {
						const point = positions.get(vertex);
						if (!point) return null;

						return (
							<g key={vertex}>
								<circle
									cx={point.x}
									cy={point.y}
									r="21"
									fill="var(--background)"
									stroke="var(--foreground)"
									strokeWidth="1.5"
								/>
								<text
									x={point.x}
									y={point.y}
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
				</g>
			</svg>
		</section>
	);
}

export { GraphVisualization };
