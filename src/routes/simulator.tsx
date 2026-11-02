import { createFileRoute, redirect } from "@tanstack/react-router";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { GraphForm } from "@/components/GraphForm";
import { GraphInsights } from "@/components/GraphInsights";
import { GraphRepresentationPanel } from "@/components/GraphRepresentationPanel";
import { GraphVisualization } from "@/components/GraphVisualization";
import { Button } from "@/components/ui/button";
import { analyzeGraph } from "@/lib/graph/analyze";
import { createGraph } from "@/lib/graph/create";
import { addEdge, removeEdge, updateGraphType } from "@/lib/graph/edges";
import { parseGraphConfig, serializeGraphConfig } from "@/lib/graph/io";
import {
	buildGraphFromRepresentation,
	type GraphConstructionStep,
	type GraphRepresentation,
} from "@/lib/graph/representations";
import type { GraphEdge, Vertex } from "@/lib/graph/types";
import { addVertex, removeVertex } from "@/lib/graph/vertices";
import { type Language, text, useLanguage } from "@/lib/i18n";
import { createPageHead } from "@/lib/seo";

const savedGraphKey = "graph-simulator-graph-v1";

function loadSavedGraph() {
	try {
		const stored = window.localStorage.getItem(savedGraphKey);
		if (stored) return parseGraphConfig(JSON.parse(stored)) ?? createGraph();
	} catch {
		// Storage may be unavailable or contain an invalid graph.
	}
	return createGraph();
}

export function SimulatorPage() {
	const [language] = useLanguage();
	const [graph, setGraph] = useState(loadSavedGraph);
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
	useEffect(() => {
		try {
			window.localStorage.setItem(savedGraphKey, serializeGraphConfig(graph));
		} catch {
			// Keep the graph usable when browser storage is full or disabled.
		}
	}, [graph]);
	const analysis = useMemo(() => analyzeGraph(graph), [graph]);
	const runRepresentation = (
		selected: GraphRepresentation,
		debugMode = false,
	) => {
		setRepresentation(selected);
		setSelectedVertex(null);
		setConstruction({
			steps: buildGraphFromRepresentation(graph, selected, language),
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
		setConfigMessage(
			text(
				language,
				`“${graph.nom}” downloaded.`,
				`« ${graph.nom} » téléchargé.`,
			),
		);
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
			setConfigMessage(
				text(language, `“${parsed.nom}” loaded.`, `« ${parsed.nom} » chargé.`),
			);
		} catch {
			setConfigError(
				text(
					language,
					"Invalid JSON. Check the graph name, vertices, and edges.",
					"JSON invalide. Vérifiez le nom, les sommets et les arêtes.",
				),
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

	const handleAddEdge = (first: Vertex, second: Vertex, weight?: number) => {
		const result = addEdge(graph, first, second, weight);
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
		<main className="w-full px-4 py-8 text-foreground sm:px-8 sm:py-10 lg:px-10 lg:py-12">
			<header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 sm:mb-12">
				<h1 className="text-2xl font-medium tracking-tight">
					{text(language, "Simulator", "Simulateur")}
				</h1>
				<div className="flex flex-wrap gap-2">
					<input
						ref={fileInputRef}
						type="file"
						accept=".json,application/json"
						className="hidden"
						aria-label={text(
							language,
							"Choose a JSON graph file",
							"Choisir un fichier JSON de graphe",
						)}
						onChange={handleImport}
					/>
					<Button
						type="button"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
					>
						{text(language, "Import JSON", "Importer JSON")}
					</Button>
					<Button type="button" variant="outline" onClick={handleExport}>
						{text(language, "Export JSON", "Exporter JSON")}
					</Button>
				</div>
				{configError && (
					<p className="w-full text-sm text-destructive" role="alert">
						{configError}
					</p>
				)}
				{configMessage && (
					<p
						className="w-full text-sm text-muted-foreground"
						aria-live="polite"
					>
						{configMessage}
					</p>
				)}
			</header>

			<GraphForm
				graph={graph}
				onGraphTypeChange={(patch) => {
					setConstruction(null);
					setSelectedVertex(null);
					setGraph((current) => updateGraphType(current, patch));
				}}
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
				className="mt-12 border-t border-border pt-8"
			>
				<div className="mb-4 flex items-baseline justify-between">
					<h2 id="graph-title" className="text-sm font-medium">
						{text(language, "Graph", "Graphe")}
					</h2>
					<span className="text-xs text-muted-foreground">
						{construction
							? `${displayedGraph.vertices.length}/${graph.vertices.length} ${text(language, "vertices", "sommets")} · ${displayedGraph.edges.length}/${graph.edges.length} ${text(language, "edges", "arêtes")}`
							: `${graph.vertices.length} ${text(language, "vertices", "sommets")} · ${graph.edges.length} ${text(language, "edges", "arêtes")}`}
					</span>
				</div>
				{construction && currentStep && (
					<div
						className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3"
						aria-live="polite"
					>
						<div className="min-w-0">
							<p className="text-sm font-medium">{currentStep.title}</p>
							<p className="mt-1 font-mono text-[11px] text-muted-foreground">
								{text(
									language,
									`Step ${construction.index + 1} / ${construction.steps.length}`,
									`Étape ${construction.index + 1} / ${construction.steps.length}`,
								)}
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
										{text(language, "Previous", "Précédent")}
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
										{text(language, "Next", "Suivant")}
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
									{construction.playing
										? text(language, "Pause", "Pause")
										: text(language, "Resume", "Reprendre")}
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
								{construction.debugMode
									? text(language, "Debug on", "Debug activé")
									: "Debug"}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setConstruction(null)}
							>
								{text(language, "Stop", "Terminer")}
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
										currentVertex: currentStep.currentVertex,
										currentEdge: currentStep.currentEdge,
									}
								: undefined
						}
					/>
				</div>
				{!construction && (
					<GraphInsights
						directed={graph.directed}
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
	beforeLoad: () => {
		const language: Language =
			window.localStorage.getItem("graph-simulator-language") === "fr"
				? "fr"
				: "en";
		throw redirect({
			to: "/$locale/$page",
			params: {
				locale: language === "fr" ? "fr-fr" : "en-us",
				page: "simulator",
			},
		});
	},
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
