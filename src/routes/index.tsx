import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GraphForm } from "@/components/GraphForm";
import { GraphVisualization } from "@/components/GraphVisualization";
import { addEdge, removeEdge } from "@/lib/graph/edges";
import { createGraph } from "@/lib/graph/create";
import type { GraphEdge } from "@/lib/graph/types";
import { addVertex, removeVertex } from "@/lib/graph/vertices";

function HomePage() {
	const [graph, setGraph] = useState(createGraph);

	const handleAddVertex = (vertex: number) => {
		const result = addVertex(graph, vertex);
		if (!result.error) setGraph(result.graph);
		return result.error;
	};

	const handleAddEdge = (first: number, second: number) => {
		const result = addEdge(graph, first, second);
		if (!result.error) setGraph(result.graph);
		return result.error;
	};

	const handleRemoveVertex = (vertex: number) =>
		setGraph((current) => removeVertex(current, vertex));
	const handleRemoveEdge = (edge: GraphEdge) =>
		setGraph((current) => removeEdge(current, edge));

	return (
		<main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 text-foreground sm:px-10 sm:py-16">
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
				<GraphVisualization {...graph} />
			</section>
		</main>
	);
}

export const Route = createFileRoute("/")({ component: HomePage });
