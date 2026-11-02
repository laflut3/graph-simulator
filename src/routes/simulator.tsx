import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { GraphForm } from "@/components/GraphForm";
import { GraphInsights } from "@/components/GraphInsights";
import { GraphRepresentationPanel } from "@/components/GraphRepresentationPanel";
import { GraphVisualization } from "@/components/GraphVisualization";
import { Button } from "@/components/ui/button";
import { analyzeGraph } from "@/lib/graph/analyze";
import { createGraph } from "@/lib/graph/create";
import { addEdge, removeEdge } from "@/lib/graph/edges";
import { parseGraphConfig, serializeGraphConfig } from "@/lib/graph/io";
import {
	buildGraphFromRepresentation,
	type GraphConstructionStep,
	type GraphRepresentation,
} from "@/lib/graph/representations";
import type { GraphEdge, Vertex } from "@/lib/graph/types";
import { addVertex, removeVertex } from "@/lib/graph/vertices";
import { createPageHead } from "@/lib/seo";

function SimulatorPage() {
	const [graph, setGraph] = useState(createGraph);
	const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null);
	const [representation, setRepresentation] =
		useState<GraphRepresentation>("neighbor-list");
	const [construction, setConstruction] = useState<{
		steps: GraphConstructionStep[];
		index: number;
		playing: boolean;
		debugMode: boolean;
		representation: GraphRepresentation;
	} | null>(null);
	const [configMessage, setConfigMessage] = useState("");
	const [configError, setConfigError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const vertices = graph.vertices;
	const edges = graph.edges;
	const analysis = useMemo(
		() => analyzeGraph({ vertices, edges }),
		[vertices, edges],
	);
	const runRepresentation = (
		selected: GraphRepresentation,
		debugMode = false,
	) => {
		setRepresentation(selected);
		setSelectedVertex(null);
		setConstruction({
			steps: buildGraphFromRepresentation(graph, selected),
			index: 0,
			playing: !debugMode,
			debugMode,
			representation: selected,
		});
	};
	const debugRepresentation = (selected: GraphRepresentation) =>
		runRepresentation(selected, true);

	useEffect(() => {
		if (!construction?.playing) return;
		const timer = window.setInterval(() => {
			setConstruction((current) => {
				if (!current) return null;
				if (current.index >= current.steps.length - 1) return null;
				return { ...current, index: current.index + 1 };
			});
		}, 550);
		return () => window.clearInterval(timer);
	}, [construction?.playing]);

	const currentStep = construction?.steps[construction.index];
	const displayedGraph = currentStep?.graph ?? graph;
	const stepConstruction = (direction: -1 | 1) => {
		setConstruction((run) => {
			if (!run) return null;
			return {
				...run,
				playing: false,
				index: Math.max(
					0,
					Math.min(run.steps.length - 1, run.index + direction),
				),
			};
		});
	};

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
			setConstruction(null);
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
		if (!result.error) {
			setConstruction(null);
			setGraph(result.graph);
		}
		return result.error;
	};

	const handleAddEdge = (first: Vertex, second: Vertex) => {
		const result = addEdge(graph, first, second);
		if (!result.error) {
			setConstruction(null);
			setGraph(result.graph);
		}
		return result.error;
	};

	const handleRemoveVertex = (vertex: string) => {
		setConstruction(null);
		setGraph((current) => removeVertex(current, vertex));
		setSelectedVertex((current) => (current === vertex ? null : current));
	};
	const handleRemoveEdge = (edge: GraphEdge) => {
		setConstruction(null);
		setGraph((current) => removeEdge(current, edge));
	};

	return (
		<main className="w-full px-4 py-10 text-foreground sm:px-8 sm:py-12 lg:px-10 lg:py-16">
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
						<p className="text-sm font-medium">Graphe non orienté simple</p>
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
				onGraphNameChange={(name) => {
					setConstruction(null);
					setGraph((current) => ({ ...current, nom: name }));
				}}
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
						{construction
							? `${displayedGraph.vertices.length}/${graph.vertices.length} sommets · ${displayedGraph.edges.length}/${graph.edges.length} arêtes`
							: `${graph.vertices.length} sommets · ${graph.edges.length} arêtes`}
					</span>
				</div>
				{construction && currentStep && (
					<div
						className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3"
						aria-live="polite"
					>
						<div className="min-w-0">
							<p className="text-sm font-medium">{currentStep.title}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{currentStep.description}
							</p>
							<p className="mt-1 font-mono text-[11px] text-muted-foreground">
								Étape {construction.index + 1} / {construction.steps.length}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{construction.debugMode ? (
								<>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={construction.index === 0}
										onClick={() => stepConstruction(-1)}
									>
										Précédent
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={
											construction.index >= construction.steps.length - 1
										}
										onClick={() => stepConstruction(1)}
									>
										Suivant
									</Button>
								</>
							) : (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										setConstruction((run) =>
											run ? { ...run, playing: !run.playing } : null,
										)
									}
								>
									{construction.playing ? "Pause" : "Reprendre"}
								</Button>
							)}
							<Button
								type="button"
								variant={construction.debugMode ? "default" : "outline"}
								size="sm"
								aria-pressed={construction.debugMode}
								onClick={() =>
									setConstruction((run) =>
										run
											? {
													...run,
													debugMode: !run.debugMode,
													playing: run.debugMode,
												}
											: null,
									)
								}
							>
								{construction.debugMode ? "Debug activé" : "Mode debug"}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setConstruction(null)}
							>
								Terminer
							</Button>
						</div>
					</div>
				)}
				<div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
					<GraphVisualization
						{...displayedGraph}
						analysis={analysis}
						selectedVertex={construction ? null : selectedVertex}
						onSelectVertex={setSelectedVertex}
						layoutVertices={graph.vertices}
						showEmptyCanvas={Boolean(construction)}
						interactive={!construction}
						currentVertex={currentStep?.currentVertex}
						currentEdge={currentStep?.currentEdge}
					/>
					<GraphRepresentationPanel
						graph={graph}
						selected={representation}
						onSelect={setRepresentation}
						onPlay={runRepresentation}
						onDebug={debugRepresentation}
						execution={
							construction && currentStep
								? {
										representation: construction.representation,
										codeLine: currentStep.codeLine,
									}
								: undefined
						}
					/>
				</div>
				{!construction && (
					<GraphInsights
						analysis={analysis}
						selectedVertex={selectedVertex}
						onSelectVertex={setSelectedVertex}
					/>
				)}
			</section>
		</main>
	);
}

export const Route = createFileRoute("/simulator")({
	head: () =>
		createPageHead({
			title: "Simulateur de graphes interactif | Graph Simulator",
			description:
				"Construisez un graphe dans votre navigateur et visualisez ses représentations, composantes connexes et cycles.",
			path: "/simulator",
			robots: "noindex, follow",
		}),
	component: SimulatorPage,
});
