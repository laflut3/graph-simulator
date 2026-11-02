import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraphForm } from "@/components/GraphForm";
import { GraphVisualization } from "@/components/GraphVisualization";
import { analyzeGraph } from "@/lib/graph/analyze";
import { createGraph } from "@/lib/graph/create";
import { addEdge, removeEdge } from "@/lib/graph/edges";
import type { GraphEdge, Vertex } from "@/lib/graph/types";
import { addVertex, removeVertex } from "@/lib/graph/vertices";

function HomePage() {
	const [graph, setGraph] = useState(createGraph);
	const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null);
	const analysis = useMemo(() => analyzeGraph(graph), [graph]);

	const handleAddVertex = (vertex: string) => {
		const result = addVertex(graph, vertex);
		if (!result.error) setGraph(result.graph);
		return result.error;
	};

	const handleAddEdge = (first: Vertex, second: Vertex) => {
		const result = addEdge(graph, first, second);
		if (!result.error) setGraph(result.graph);
		return result.error;
	};

	const handleRemoveVertex = (vertex: string) => {
		setGraph((current) => removeVertex(current, vertex));
		setSelectedVertex((current) => (current === vertex ? null : current));
	};
	const handleRemoveEdge = (edge: GraphEdge) =>
		setGraph((current) => removeEdge(current, edge));

	return (
		<main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12 text-foreground sm:px-10 sm:py-16">
			<header className="mb-14 border-b border-border pb-8 sm:mb-16">
				<p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
					Théorie des graphes
				</p>
				<div className="flex flex-wrap items-baseline justify-between gap-4">
					<h1 className="font-mono text-3xl font-medium tracking-tight sm:text-4xl">
						G = [V, E]
					</h1>
					<p className="text-sm text-muted-foreground">
						Graphe non orienté simple
					</p>
				</div>
			</header>

			<GraphForm
				graph={graph}
				onAddVertex={handleAddVertex}
				onAddEdge={handleAddEdge}
				onRemoveVertex={handleRemoveVertex}
				onRemoveEdge={handleRemoveEdge}
			/>

			<section
				aria-labelledby="graph-title"
				className="mt-16 border-t border-border pt-8"
			>
				<div className="mb-4 flex items-baseline justify-between">
					<h2 id="graph-title" className="text-sm font-medium">
						Graphe
					</h2>
					<span className="text-xs text-muted-foreground">
						{graph.vertices.length} sommets · {graph.edges.length} arêtes
					</span>
				</div>
				<GraphVisualization
					{...graph}
					analysis={analysis}
					selectedVertex={selectedVertex}
					onSelectVertex={setSelectedVertex}
				/>
			</section>
		</main>
	);
}

export const Route = createFileRoute("/")({ component: HomePage });
