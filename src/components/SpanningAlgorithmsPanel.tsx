import { useMemo, useState } from "react";
import { GraphVisualization } from "@/components/GraphVisualization";
import { analyzeGraph } from "@/lib/graph/analyze";
import {
	buildSpanningSteps,
	type SpanningAlgorithm,
} from "@/lib/graph/spanning";
import type { Graph } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

export function SpanningAlgorithmsPanel({ graph }: { graph: Graph }) {
	const [language] = useLanguage();
	const [algorithm, setAlgorithm] =
		useState<SpanningAlgorithm>("spanning-tree");
	const [index, setIndex] = useState(-1);
	const steps = useMemo(
		() => buildSpanningSteps(graph, algorithm),
		[graph, algorithm],
	);
	const step = steps[index];
	const result = step?.graph ?? { ...graph, edges: [] };
	const analysis = useMemo(() => analyzeGraph(result), [result]);
	const complete = index === steps.length - 1 && steps.length > 0;
	const connected =
		graph.vertices.length === 0 || analysis.components.length === 1;
	const weight = result.edges.reduce(
		(sum, edge) => sum + (edge.weight ?? 1),
		0,
	);
	const names = {
		"spanning-tree": text(language, "Spanning forest", "Forêt couvrante"),
		kruskal: "Kruskal",
	};

	return (
		<section
			aria-labelledby="spanning-title"
			className="mt-6 rounded-2xl border border-border bg-card/40 shadow-sm sm:mt-8"
		>
			<header className="space-y-3 border-b border-border bg-muted/20 p-4 sm:p-5">
				<div>
					<h2 id="spanning-title" className="text-sm font-semibold">
						{text(
							language,
							"Algorithms · spanning subgraphs",
							"Algorithmes · sous-graphes couvrants",
						)}
					</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						{text(
							language,
							"Keep every vertex and select edges without creating cycles.",
							"Conservez tous les sommets et sélectionnez des arêtes sans créer de cycle.",
						)}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<label className="sr-only" htmlFor="spanning-algorithm">
						{text(language, "Algorithm", "Algorithme")}
					</label>
					<select
						id="spanning-algorithm"
						value={algorithm}
						onChange={(event) => {
							setAlgorithm(event.target.value as SpanningAlgorithm);
							setIndex(-1);
						}}
						className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm sm:max-w-xs"
					>
						<option value="spanning-tree">
							{names["spanning-tree"]} ·{" "}
							{text(language, "edge order", "ordre des arêtes")}
						</option>
						<option value="kruskal">
							Kruskal · {text(language, "minimum weight", "poids minimum")}
						</option>
					</select>
					<button
						type="button"
						className="min-h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-50"
						disabled={index < 0}
						onClick={() => setIndex(Math.max(-1, index - 1))}
					>
						{text(language, "Previous", "Précédent")}
					</button>
					<button
						type="button"
						className="min-h-10 rounded-lg bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
						disabled={complete || graph.directed || !graph.edges.length}
						onClick={() => setIndex(Math.min(steps.length - 1, index + 1))}
					>
						{index < 0
							? text(language, "Start", "Démarrer")
							: text(language, "Next edge", "Arête suivante")}
					</button>
					<button
						type="button"
						className="min-h-10 rounded-lg border border-border px-3 text-sm"
						onClick={() => setIndex(-1)}
					>
						{text(language, "Reset", "Réinitialiser")}
					</button>
				</div>
			</header>
			{graph.directed ? (
				<p className="p-5 text-sm text-muted-foreground">
					{text(
						language,
						"Spanning trees and Kruskal are defined here for undirected graphs. Switch off directed mode to run them.",
						"Les arbres couvrants et Kruskal sont présentés ici pour les graphes non orientés. Désactivez l’orientation pour les exécuter.",
					)}
				</p>
			) : (
				<div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)]">
					<div className="min-w-0">
						<div
							className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
							aria-live="polite"
						>
							<span>
								{index < 0
									? text(
											language,
											"No edges processed yet.",
											"Aucune arête traitée pour le moment.",
										)
									: text(
											language,
											`Edge ${index + 1} / ${steps.length}: ${step?.accepted ? "kept" : "rejected"}`,
											`Arête ${index + 1} / ${steps.length} : ${step?.accepted ? "retenue" : "rejetée"}`,
										)}
							</span>
							<span>
								{result.vertices.length} {text(language, "vertices", "sommets")}{" "}
								· {result.edges.length} {text(language, "edges", "arêtes")}
							</span>
						</div>
						<GraphVisualization
							{...result}
							analysis={analysis}
							selectedVertex={null}
							onSelectVertex={() => {}}
							interactive={false}
							layoutVertices={graph.vertices}
							showEmptyCanvas
						/>
						<p className="mt-3 text-sm" aria-live="polite">
							{index < 0
								? text(
										language,
										"The subgraph will appear here as edges are processed.",
										"Le sous-graphe apparaîtra ici au fil du traitement des arêtes.",
									)
								: step?.accepted
									? text(
											language,
											"Kept: this edge joins two different components.",
											"Retenue : cette arête relie deux composantes différentes.",
										)
									: text(
											language,
											"Rejected: this edge would create a cycle.",
											"Rejetée : cette arête créerait un cycle.",
										)}
						</p>
					</div>
					<aside className="rounded-xl border border-border bg-background p-4">
						<h3 className="text-sm font-medium">
							{complete && connected
								? text(language, "Spanning tree", "Arbre couvrant")
								: text(language, "Current subgraph", "Sous-graphe courant")}
						</h3>
						<p className="mt-1 text-xs text-muted-foreground">
							{complete && !connected
								? text(
										language,
										"The input is disconnected; the result is a spanning forest.",
										"Le graphe initial n’est pas connexe ; le résultat est une forêt couvrante.",
									)
								: complete && connected
									? text(
											language,
											"All vertices are connected with no cycles.",
											"Tous les sommets sont reliés sans cycle.",
										)
									: text(
											language,
											"The subgraph contains every original vertex and only the accepted edges.",
											"Le sous-graphe contient tous les sommets initiaux et uniquement les arêtes retenues.",
										)}
						</p>
						<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
							<div>
								<dt className="text-xs text-muted-foreground">
									{text(language, "Components", "Composantes")}
								</dt>
								<dd className="mt-1 font-mono">{analysis.components.length}</dd>
							</div>
							<div>
								<dt className="text-xs text-muted-foreground">
									{text(language, "Edges", "Arêtes")}
								</dt>
								<dd className="mt-1 font-mono">
									{result.edges.length} /{" "}
									{Math.max(
										0,
										result.vertices.length - analysis.components.length,
									)}
								</dd>
							</div>
							{algorithm === "kruskal" && (
								<div className="col-span-2">
									<dt className="text-xs text-muted-foreground">
										{text(language, "Total weight", "Poids total")}
									</dt>
									<dd className="mt-1 font-mono">{weight}</dd>
								</div>
							)}
						</dl>
					</aside>
				</div>
			)}
		</section>
	);
}
