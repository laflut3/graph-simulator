import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GraphForm } from "@/components/GraphForm";
import { GraphVisualization } from "@/components/GraphVisualization";
import type { GraphEdge } from "@/types/graph";

function HomePage() {
	const [vertices, setVertices] = useState([1, 2, 3, 4]);
	const [edges, setEdges] = useState<GraphEdge[]>([
		{ first: 1, second: 2 },
		{ first: 1, second: 3 },
	]);

	const addVertex = (vertex: number) => {
		if (vertices.includes(vertex)) return "Ce sommet existe déjà.";
		setVertices((current) => [...current, vertex].sort((a, b) => a - b));
		return null;
	};

	const addEdge = (first: number, second: number) => {
		if (
			!vertices.includes(first) ||
			!vertices.includes(second) ||
			first === second
		) {
			return "Choisissez deux sommets différents.";
		}
		if (
			edges.some(
				(edge) =>
					(edge.first === first && edge.second === second) ||
					(edge.first === second && edge.second === first),
			)
		) {
			return "Cette arête existe déjà.";
		}

		setEdges((current) =>
			[
				...current,
				{ first: Math.min(first, second), second: Math.max(first, second) },
			].sort((a, b) => a.first - b.first || a.second - b.second),
		);
		return null;
	};

	const removeVertex = (vertex: number) => {
		setVertices((current) => current.filter((item) => item !== vertex));
		setEdges((current) =>
			current.filter((edge) => edge.first !== vertex && edge.second !== vertex),
		);
	};

	const removeEdge = (edge: GraphEdge) => {
		setEdges((current) =>
			current.filter(
				(item) => item.first !== edge.first || item.second !== edge.second,
			),
		);
	};

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
				vertices={vertices}
				edges={edges}
				onAddVertex={addVertex}
				onAddEdge={addEdge}
				onRemoveVertex={removeVertex}
				onRemoveEdge={removeEdge}
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
						{vertices.length} sommets · {edges.length} arêtes
					</span>
				</div>
				<GraphVisualization vertices={vertices} edges={edges} />
			</section>
		</main>
	);
}

export const Route = createFileRoute("/")({ component: HomePage });
