import { useEffect, useMemo, useState } from "react";
import { analyzeGraph } from "@/lib/graph/analyze";
import {
	buildSpanningSteps,
	getSpanningPseudocode,
	type SpanningAlgorithm,
} from "@/lib/graph/spanning";
import type { Graph } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

export function SpanningAlgorithmsPanel({
	graph,
	onDisplayGraph,
}: {
	graph: Graph;
	onDisplayGraph: (graph: Graph | null) => void;
}) {
	const [language] = useLanguage();
	const [algorithm, setAlgorithm] =
		useState<SpanningAlgorithm>("spanning-tree");
	const [index, setIndex] = useState(-1);
	const [executionMode, setExecutionMode] = useState<
		"idle" | "running" | "paused" | "debug"
	>("idle");
	const steps = useMemo(
		() => buildSpanningSteps(graph, algorithm),
		[graph, algorithm],
	);
	const step = steps[index];
	const pseudocode = getSpanningPseudocode(algorithm);
	const componentLabels =
		step?.componentLabels ?? graph.vertices.map((vertex) => [vertex, vertex]);
	const result = useMemo(
		() => step?.graph ?? { ...graph, edges: [] },
		[graph, step],
	);
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
	useEffect(() => {
		onDisplayGraph(result);
	}, [onDisplayGraph, result]);
	useEffect(() => () => onDisplayGraph(null), [onDisplayGraph]);
	useEffect(() => {
		if (executionMode !== "running") return;
		const timer = window.setInterval(() => {
			if (index >= steps.length - 1) {
				setExecutionMode("paused");
				return;
			}
			const nextIndex = index + 1;
			setIndex(nextIndex);
			if (nextIndex >= steps.length - 1) setExecutionMode("paused");
		}, 550);
		return () => window.clearInterval(timer);
	}, [executionMode, index, steps.length]);

	return (
		<div className="min-w-0">
			<header className="space-y-3 border-b border-border bg-muted/20 p-4 sm:p-5">
				<div>
					<h3 className="text-sm font-semibold">
						{text(
							language,
							"Algorithms · spanning subgraphs",
							"Algorithmes · sous-graphes couvrants",
						)}
					</h3>
					<p className="mt-1 text-xs text-muted-foreground">
						{text(
							language,
							"Keep every vertex and select edges without creating cycles.",
							"Conservez tous les sommets et sélectionnez des arêtes sans créer de cycle.",
						)}
					</p>
					{algorithm === "kruskal" && (
						<p className="mt-1 text-xs text-muted-foreground">
							{graph.weighted
								? text(
										language,
										"Edges are sorted by their actual weights in increasing order.",
										"Les arêtes sont triées par poids réel croissant.",
									)
								: text(
										language,
										"This graph is unweighted, so every edge uses weight 1.",
										"Ce graphe n’est pas pondéré ; chaque arête reçoit le poids 1.",
									)}
						</p>
					)}
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
							setExecutionMode("idle");
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
						className="min-h-10 rounded-lg bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
						disabled={graph.directed || !graph.edges.length}
						onClick={() => {
							if (index >= steps.length - 1) setIndex(-1);
							setExecutionMode("running");
						}}
					>
						{text(language, "Run", "Exécuter")}
					</button>
					<button
						type="button"
						className="min-h-10 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 text-sm text-blue-700 hover:bg-blue-500/10 dark:text-blue-300"
						aria-pressed={executionMode === "debug"}
						disabled={graph.directed || !graph.edges.length}
						onClick={() => setExecutionMode("debug")}
					>
						{text(language, "Debug", "Déboguer")}
					</button>
					{executionMode === "debug" && (
						<>
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
								className="min-h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-50"
								disabled={complete}
								onClick={() => setIndex(Math.min(steps.length - 1, index + 1))}
							>
								{text(language, "Next", "Suivant")}
							</button>
						</>
					)}
					{executionMode === "running" && (
						<button
							type="button"
							className="min-h-10 rounded-lg border border-border px-3 text-sm"
							onClick={() => setExecutionMode("paused")}
						>
							{text(language, "Pause", "Pause")}
						</button>
					)}
					{executionMode === "paused" && (
						<button
							type="button"
							className="min-h-10 rounded-lg border border-border px-3 text-sm"
							onClick={() => setExecutionMode("running")}
						>
							{text(language, "Resume", "Reprendre")}
						</button>
					)}
					<button
						type="button"
						className="min-h-10 rounded-lg border border-border px-3 text-sm"
						onClick={() => {
							setExecutionMode("idle");
							setIndex(-1);
						}}
					>
						{text(language, "Stop", "Arrêter")}
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
				<>
					<div className="grid gap-4 p-4 sm:p-5">
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
									{result.vertices.length}{" "}
									{text(language, "vertices", "sommets")} ·{" "}
									{result.edges.length} {text(language, "edges", "arêtes")}
								</span>
							</div>
							{step && (
								<p
									className="mb-3 rounded-md bg-muted/40 px-2 py-1.5 font-mono text-xs"
									aria-live="polite"
								>
									{step.edge.first} — {step.edge.second}
									{graph.weighted || algorithm === "kruskal"
										? ` · ${text(language, "weight", "poids")} ${step.edge.weight ?? 1}`
										: ""}
								</p>
							)}
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
									<dd className="mt-1 font-mono">
										{analysis.components.length}
									</dd>
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
					<div className="grid gap-4 border-t border-border p-4 sm:p-5 lg:grid-cols-2">
						<section
							aria-labelledby="spanning-pseudocode-title"
							className="min-w-0"
						>
							<h4
								id="spanning-pseudocode-title"
								className="mb-3 text-xs font-semibold"
							>
								{text(language, "Pseudocode", "Pseudo-code")}
							</h4>
							<ol className="space-y-1 font-mono text-[11px] leading-5">
								{pseudocode.map((line, lineIndex) => (
									<li
										key={line}
										aria-current={
											step?.codeLine === lineIndex + 1 ? "step" : undefined
										}
										className={`grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 rounded px-2 py-0.5 ${step?.codeLine === lineIndex + 1 ? "construction-item-active text-foreground" : "text-muted-foreground"}`}
									>
										<span className="select-none text-right opacity-60">
											{lineIndex + 1}
										</span>
										<code className="whitespace-pre-wrap">{line}</code>
									</li>
								))}
							</ol>
						</section>
						<section
							aria-labelledby="component-array-title"
							className="min-w-0"
						>
							<h4
								id="component-array-title"
								className="mb-3 text-xs font-semibold"
							>
								{text(
									language,
									"Component array · comp",
									"Tableau des composantes · comp",
								)}
							</h4>
							<p className="mb-2 text-[11px] text-muted-foreground">
								{text(
									language,
									"One entry per vertex; equal labels mean the vertices are already connected in the selected subgraph.",
									"Une entrée par sommet ; des étiquettes égales indiquent que les sommets sont déjà reliés dans le sous-graphe sélectionné.",
								)}
							</p>
							<div className="max-h-44 overflow-auto rounded-lg border border-border">
								<table className="w-full text-left font-mono text-xs">
									<thead className="sticky top-0 bg-muted text-muted-foreground">
										<tr>
											<th className="px-3 py-2 font-medium">
												{text(language, "Vertex", "Sommet")}
											</th>
											<th className="px-3 py-2 font-medium">comp[vertex]</th>
										</tr>
									</thead>
									<tbody>
										{componentLabels.map(([vertex, label]) => (
											<tr
												key={vertex}
												className="border-t border-border even:bg-muted/30"
											>
												<th scope="row" className="px-3 py-1.5 font-medium">
													{vertex}
												</th>
												<td className="px-3 py-1.5">{label}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					</div>
				</>
			)}
		</div>
	);
}
