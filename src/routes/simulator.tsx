import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { GraphForm } from "@/components/GraphForm";
import { GraphVisualization } from "@/components/GraphVisualization";
import { Button } from "@/components/ui/button";
import { analyzeGraph } from "@/lib/graph/analyze";
import { createGraph } from "@/lib/graph/create";
import { addEdge, removeEdge } from "@/lib/graph/edges";
import { parseGraphConfig, serializeGraphConfig } from "@/lib/graph/io";
import type { GraphEdge, Vertex } from "@/lib/graph/types";
import { addVertex, removeVertex } from "@/lib/graph/vertices";

function SimulatorPage() {
	const [graph, setGraph] = useState(createGraph);
	const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null);
	const [configMessage, setConfigMessage] = useState("");
	const [configError, setConfigError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const analysis = useMemo(() => analyzeGraph(graph), [graph]);

	const handleExport = () => {
		const fileName =
			graph.nom
				.normalize("NFKD")
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/[^\w-]+/g, "-")
				.replace(/^-|-$/g, "") || "graphe";
		const blob = new Blob([serializeGraphConfig(graph)], {
			type: "application/json;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${fileName}.json`;
		link.click();
		URL.revokeObjectURL(url);
		setConfigMessage(`Configuration « ${graph.nom} » téléchargée.`);
		setConfigError("");
	};

	const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		setConfigMessage("");
		setConfigError("");
		try {
			const parsed = parseGraphConfig(JSON.parse(await file.text()));
			if (!parsed) throw new Error("invalid-config");
			setGraph(parsed);
			setSelectedVertex(null);
			setConfigMessage(`Configuration « ${parsed.nom} » chargée.`);
		} catch {
			setConfigError(
				"Fichier JSON invalide : vérifiez le nom, les sommets et les arêtes.",
			);
		} finally {
			input.value = "";
		}
	};

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
		<main className="mx-auto w-full max-w-6xl px-6 py-12 text-foreground sm:px-10 sm:py-16">
			<header className="mb-14 border-b border-border pb-8 sm:mb-16">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
						Théorie des graphes
					</p>
					<div className="flex flex-wrap gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept=".json,application/json"
							className="hidden"
							aria-label="Choisir un fichier de configuration JSON"
							onChange={handleImport}
						/>
						<Button
							type="button"
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
						>
							Importer JSON
						</Button>
						<Button type="button" variant="outline" onClick={handleExport}>
							Télécharger JSON
						</Button>
					</div>
				</div>
				<div className="flex flex-wrap items-baseline justify-between gap-4">
					<h1 className="font-mono text-3xl font-medium tracking-tight sm:text-4xl">
						G = [V, E]
					</h1>
					<div className="text-right">
						<p className="text-sm font-medium">{graph.nom}</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Graphe non orienté simple
						</p>
					</div>
				</div>
				<p className="mt-3 min-h-5 text-sm text-destructive" role="alert">
					{configError}
				</p>
				<p
					className="mt-1 min-h-5 text-sm text-muted-foreground"
					aria-live="polite"
				>
					{configMessage}
				</p>
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

export const Route = createFileRoute("/simulator")({
	component: SimulatorPage,
});
