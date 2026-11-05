import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { analyzeGraph } from "@/lib/graph/analyze";
import {
	buildSpanningSteps,
	getSpanningPseudocode,
	type SpanningAlgorithm,
	sortEdgesByWeight,
} from "@/lib/graph/spanning";
import {
	buildTraversalSteps,
	getTraversalPseudocode,
	type TraversalAlgorithm,
	type TraversalStep,
} from "@/lib/graph/traversal";
import type { Graph } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type GraphAlgorithm = SpanningAlgorithm | TraversalAlgorithm;
type SpanningStep = ReturnType<typeof buildSpanningSteps>[number];
type AlgorithmStep = SpanningStep | TraversalStep;

type Props = {
	graph: Graph;
	onDisplayGraph: (graph: Graph | null) => void;
};

function PlayIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="currentColor"
			className="size-4"
		>
			<path d="M5 3.5a.75.75 0 0 1 1.13-.65l6.25 3.75a.75.75 0 0 1 0 1.29l-6.25 3.75A.75.75 0 0 1 5 11V3.5Z" />
		</svg>
	);
}

function DebugBugIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.35"
			className="size-4"
		>
			<path d="M8 2.1v1.4M5.1 3.7 4 2.6m6.9 1.1L12 2.6M2.2 6h2m7.6 0h2M2.2 10h2m7.6 0h2M8 5.3v7.1" />
			<rect x="5" y="4" width="6" height="9" rx="3" />
		</svg>
	);
}

export function GraphAlgorithmsPanel({ graph, onDisplayGraph }: Props) {
	const [language] = useLanguage();
	const [algorithm, setAlgorithm] = useState<GraphAlgorithm>(() =>
		graph.weighted ? "kruskal" : "components",
	);
	const [startVertex, setStartVertex] = useState(graph.vertices[0] ?? "");
	const isTraversal = algorithm === "bfs" || algorithm === "dfs";
	const [index, setIndex] = useState(-1);
	const [executionMode, setExecutionMode] = useState<
		"idle" | "running" | "paused" | "debug"
	>("idle");
	const spanningSteps = useMemo(
		() =>
			isTraversal
				? []
				: buildSpanningSteps(graph, algorithm as SpanningAlgorithm),
		[graph, algorithm, isTraversal],
	);
	const traversalSteps = useMemo(
		() =>
			isTraversal ? buildTraversalSteps(graph, algorithm, startVertex) : [],
		[graph, algorithm, isTraversal, startVertex],
	);
	const steps: AlgorithmStep[] = isTraversal ? traversalSteps : spanningSteps;
	const step = steps[index];
	const spanningStep = isTraversal
		? undefined
		: (step as SpanningStep | undefined);
	const traversalStep = isTraversal
		? (step as TraversalStep | undefined)
		: undefined;
	const pseudocode = isTraversal
		? getTraversalPseudocode(algorithm as TraversalAlgorithm)
		: getSpanningPseudocode(algorithm as SpanningAlgorithm);
	const sortedEdges = useMemo(() => sortEdgesByWeight(graph), [graph]);
	const inputAnalysis = useMemo(() => analyzeGraph(graph), [graph]);
	const inputConnected =
		graph.vertices.length === 0 || inputAnalysis.components.length === 1;
	const componentLabels =
		spanningStep?.componentLabels ??
		graph.vertices.map((vertex) => [vertex, "—"]);
	const result = useMemo(
		() =>
			step?.graph ??
			(algorithm === "components" ? graph : { ...graph, edges: [] }),
		[algorithm, graph, step],
	);
	const resultAnalysis = useMemo(() => analyzeGraph(result), [result]);
	const complete = index === steps.length - 1 && steps.length > 0;
	const weight = result.edges.reduce(
		(sum, edge) => sum + (edge.weight ?? 1),
		0,
	);
	const names: Record<GraphAlgorithm, string> = {
		components: text(
			language,
			"Connected components · comp[x]",
			"Composantes connexes · comp[x]",
		),
		"spanning-tree": text(language, "Spanning forest", "Forêt couvrante"),
		kruskal: text(language, "Kruskal", "Kruskal"),
		bfs: text(
			language,
			"Breadth-first search · BFS",
			"Parcours en largeur · BFS",
		),
		dfs: text(
			language,
			"Depth-first search · DFS",
			"Parcours en profondeur · DFS",
		),
	};
	const canRun = isTraversal ? graph.vertices.length > 0 : !graph.directed;

	useEffect(() => {
		onDisplayGraph(result);
	}, [onDisplayGraph, result]);
	useEffect(() => () => onDisplayGraph(null), [onDisplayGraph]);
	useEffect(() => {
		setAlgorithm(graph.weighted ? "kruskal" : "components");
		setStartVertex(graph.vertices[0] ?? "");
		setIndex(-1);
		setExecutionMode("idle");
	}, [graph]);
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

	const startRun = () => {
		if (complete) setIndex(-1);
		setExecutionMode("running");
	};
	const setAlgorithmAndReset = (value: GraphAlgorithm) => {
		setAlgorithm(value);
		setIndex(-1);
		setExecutionMode("idle");
	};
	const setRootAndReset = (value: string) => {
		setStartVertex(value);
		setIndex(-1);
		setExecutionMode("idle");
	};

	return (
		<div className="@container min-w-0">
			<header className="space-y-4 border-b border-border bg-muted/20 p-4 sm:p-5">
				<div>
					<h3 className="text-sm font-semibold">
						{text(language, "Graph algorithms", "Algorithmes de graphes")}
					</h3>
					<p className="mt-1 text-xs leading-5 text-muted-foreground">
						{algorithm === "components"
							? text(
									language,
									"Follow comp[x] as the algorithm joins connected components.",
									"Suivez comp[x] à mesure que l’algorithme réunit les composantes connexes.",
								)
							: isTraversal
								? algorithm === "bfs"
									? text(
											language,
											"Visit vertices layer by layer with a FIFO queue.",
											"Visitez les sommets par couches à l’aide d’une file FIFO.",
										)
									: text(
											language,
											"Follow each branch as far as possible, then backtrack.",
											"Suivez chaque branche aussi loin que possible, puis revenez en arrière.",
										)
								: text(
										language,
										"Keep every vertex; add an edge only when it joins separate components.",
										"Gardez tous les sommets et ajoutez une arête seulement si elle relie deux composantes distinctes.",
									)}
					</p>
					{algorithm === "kruskal" && !inputConnected && (
						<p className="mt-2 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-800 dark:text-amber-300">
							{text(
								language,
								`The input has ${inputAnalysis.components.length} connected components, so no spanning tree exists. Kruskal returns a minimum spanning forest.`,
								`Le graphe initial a ${inputAnalysis.components.length} composantes connexes : il ne possède pas d’arbre couvrant. Kruskal renvoie une forêt couvrante de poids minimum.`,
							)}
						</p>
					)}
					{algorithm === "spanning-tree" && graph.weighted && (
						<p className="mt-2 text-xs text-muted-foreground">
							{text(
								language,
								"This follows input edge order; choose Kruskal to minimize total weight.",
								"Cet algorithme suit l’ordre des arêtes d’entrée ; choisissez Kruskal pour minimiser le poids total.",
							)}
						</p>
					)}
					{isTraversal && (
						<p className="mt-2 text-xs text-muted-foreground">
							{text(
								language,
								"Start here, then restart at each still-unvisited vertex to cover the whole graph. Neighbor order follows the edge list.",
								"Le parcours commence ici, puis repart de chaque sommet encore inexploré pour couvrir le graphe. L’ordre des voisins suit la liste des arêtes.",
							)}
						</p>
					)}
					{isTraversal && (
						<div className="grid max-w-xs gap-1.5">
							<label
								className="text-xs text-muted-foreground"
								htmlFor="traversal-root"
							>
								{text(language, "Starting vertex", "Sommet de départ")}
							</label>
							<select
								id="traversal-root"
								value={startVertex}
								disabled={!graph.vertices.length}
								onChange={(event) => setRootAndReset(event.target.value)}
								className="h-10 min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
							>
								{graph.vertices.map((vertex) => (
									<option key={vertex} value={vertex}>
										{vertex}
									</option>
								))}
							</select>
						</div>
					)}
					{algorithm === "kruskal" && (
						<p className="mt-2 text-xs text-muted-foreground">
							{graph.weighted
								? text(
										language,
										"Kruskal processes actual weights in increasing order.",
										"Kruskal traite les poids réels par ordre croissant.",
									)
								: text(
										language,
										"Unweighted edges all have weight 1; ties use endpoint order.",
										"Les arêtes non pondérées valent toutes 1 ; les égalités sont départagées par leurs extrémités.",
									)}
						</p>
					)}
				</div>

				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<label className="sr-only" htmlFor="graph-algorithm-selection">
						{text(language, "Algorithm", "Algorithme")}
					</label>
					<select
						id="graph-algorithm-selection"
						value={algorithm}
						onChange={(event) =>
							setAlgorithmAndReset(event.target.value as GraphAlgorithm)
						}
						className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background py-2 pl-3 pr-10 text-xs font-medium text-foreground sm:max-w-xs"
					>
						<optgroup
							label={text(
								language,
								"Components and spanning trees",
								"Composantes et arbres couvrants",
							)}
						>
							<option value="components">{names.components}</option>
							<option value="spanning-tree">
								{names["spanning-tree"]} ·{" "}
								{text(language, "edge order", "ordre des arêtes")}
							</option>
							<option value="kruskal">
								Kruskal ·{" "}
								{inputConnected
									? text(
											language,
											"minimum spanning tree",
											"arbre couvrant minimum",
										)
									: text(
											language,
											"minimum spanning forest",
											"forêt couvrante minimale",
										)}
							</option>
						</optgroup>
						<optgroup label={text(language, "Traversals", "Parcours")}>
							<option value="bfs">{names.bfs}</option>
							<option value="dfs">{names.dfs}</option>
						</optgroup>
					</select>
					<button
						type="button"
						aria-label={text(
							language,
							"Run algorithm",
							"Exécuter l’algorithme",
						)}
						title={text(language, "Run algorithm", "Exécuter l’algorithme")}
						className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
						disabled={!canRun}
						onClick={startRun}
					>
						<PlayIcon />
					</button>
					<button
						type="button"
						aria-label={text(
							language,
							"Debug step by step",
							"Déboguer pas à pas",
						)}
						title={text(language, "Debug step by step", "Déboguer pas à pas")}
						className="grid size-10 shrink-0 place-items-center rounded-lg border border-blue-500/15 bg-blue-500/5 text-blue-600 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-blue-400 dark:hover:bg-blue-400/10 disabled:opacity-50"
						aria-pressed={executionMode === "debug"}
						disabled={!canRun}
						onClick={() => setExecutionMode("debug")}
					>
						<DebugBugIcon />
					</button>
					{executionMode === "debug" && (
						<>
							<StepButton
								disabled={index < 0}
								onClick={() => setIndex(index - 1)}
							>
								{text(language, "Previous", "Précédent")}
							</StepButton>
							<StepButton
								disabled={complete}
								onClick={() => setIndex(index + 1)}
							>
								{text(language, "Next", "Suivant")}
							</StepButton>
						</>
					)}
					{executionMode === "running" && (
						<StepButton onClick={() => setExecutionMode("paused")}>
							{text(language, "Pause", "Pause")}
						</StepButton>
					)}
					{executionMode === "paused" && (
						<StepButton onClick={() => setExecutionMode("running")}>
							{text(language, "Resume", "Reprendre")}
						</StepButton>
					)}
					<StepButton
						onClick={() => {
							setExecutionMode("idle");
							setIndex(-1);
						}}
					>
						{text(language, "Stop", "Arrêter")}
					</StepButton>
				</div>
			</header>

			{graph.directed && !isTraversal ? (
				<p className="p-5 text-sm text-muted-foreground">
					{text(
						language,
						"These algorithms are defined for undirected graphs.",
						"Ces algorithmes sont définis pour les graphes non orientés.",
					)}
				</p>
			) : (
				<>
					{algorithm === "kruskal" && graph.weighted && (
						<section
							className="grid gap-4 border-b border-border p-4 sm:p-5 @2xl:grid-cols-2"
							aria-label={text(
								language,
								"Kruskal edge sorting",
								"Tri des arêtes de Kruskal",
							)}
						>
							<EdgeOrder
								title={text(language, "Before sorting", "Avant le tri")}
								edges={graph.edges}
								highlighted={step?.edge}
							/>
							<EdgeOrder
								title={text(
									language,
									"After sorting · increasing weight",
									"Après le tri · poids croissant",
								)}
								edges={sortedEdges}
								highlighted={step?.edge}
							/>
						</section>
					)}
					<div className="min-h-52 space-y-4 p-4 sm:p-5">
						<div className="min-w-0">
							<div
								className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
								aria-live="polite"
							>
								<span>
									{index < 0
										? text(language, "Ready", "Prêt")
										: text(
												language,
												`Step ${index + 1} / ${steps.length} · line ${step?.codeLine}`,
												`Étape ${index + 1} / ${steps.length} · ligne ${step?.codeLine}`,
											)}
								</span>
								<span>
									{result.vertices.length}{" "}
									{text(language, "vertices", "sommets")} ·{" "}
									{result.edges.length} {text(language, "edges", "arêtes")}
								</span>
							</div>
							{step?.edge && (
								<p
									className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs"
									aria-live="polite"
								>
									<span>
										{step.edge.first} — {step.edge.second}
									</span>
									<span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
										{isTraversal
											? step.accepted === undefined
												? text(language, "Checking", "À examiner")
												: !step.accepted
													? text(language, "Already visited", "Déjà visité")
													: (algorithm === "bfs" && step.codeLine === 9) ||
															(algorithm === "dfs" && step.codeLine === 8)
														? text(language, "New vertex", "Nouveau sommet")
														: text(language, "Tree edge", "Arête d’arbre")
											: step.accepted === false
												? text(language, "Rejected", "Écartée")
												: step.accepted === true
													? text(language, "Selected", "Retenue")
													: text(language, "Under review", "À examiner")}
									</span>
									{(!isTraversal && graph.weighted) ||
									algorithm === "kruskal" ? (
										<span>
											{text(language, "Weight", "Poids")} :{" "}
											{step.edge.weight ?? 1}
										</span>
									) : null}
								</p>
							)}
							<p className="text-sm leading-6" aria-live="polite">
								{isTraversal
									? describeTraversalStep(
											language,
											algorithm as TraversalAlgorithm,
											traversalStep,
											pseudocode,
										)
									: describeStep(
											language,
											algorithm as SpanningAlgorithm,
											spanningStep,
											pseudocode,
										)}
							</p>
						</div>
						<aside className="rounded-xl border border-border bg-background p-4">
							<h3 className="text-sm font-medium">
								{isTraversal
									? algorithm === "bfs"
										? text(
												language,
												"BFS traversal forest",
												"Forêt de parcours BFS",
											)
										: text(
												language,
												"DFS traversal forest",
												"Forêt de parcours DFS",
											)
									: algorithm === "components"
										? text(
												language,
												"Connected components",
												"Composantes connexes",
											)
										: complete && inputConnected
											? text(language, "Spanning tree", "Arbre couvrant")
											: text(
													language,
													"Current subgraph",
													"Sous-graphe courant",
												)}
							</h3>
							<p className="mt-1 text-xs text-muted-foreground">
								{isTraversal
									? algorithm === "bfs"
										? text(
												language,
												"The tree edges record the parent of each discovered vertex.",
												"Les arêtes de l’arbre indiquent le parent de chaque sommet découvert.",
											)
										: text(
												language,
												"Each DFS tree edge records the branch used to reach a vertex.",
												"Chaque arête de l’arbre DFS indique la branche suivie pour atteindre un sommet.",
											)
									: algorithm === "components"
										? text(
												language,
												"Equal comp[x] labels identify vertices in the same connected component.",
												"Des étiquettes comp[x] égales indiquent des sommets dans la même composante connexe.",
											)
										: complete && !inputConnected
											? text(
													language,
													"The result is a minimum spanning forest; the input has no spanning tree.",
													"Le résultat est une forêt couvrante minimale ; le graphe initial n’a pas d’arbre couvrant.",
												)
											: complete
												? text(
														language,
														"All vertices are connected with no cycles.",
														"Tous les sommets sont reliés sans cycle.",
													)
												: text(
														language,
														"The subgraph contains all vertices and only edges accepted so far.",
														"Le sous-graphe contient tous les sommets et uniquement les arêtes retenues jusque-là.",
													)}
							</p>
							<dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
								<Metric
									label={
										isTraversal
											? text(language, "Roots", "Racines")
											: text(language, "Components", "Composantes")
									}
									value={
										isTraversal && traversalStep
											? traversalStep.rows.filter(
													(row) =>
														row.parent === null &&
														(row.level !== null || row.entry !== null),
												).length
											: resultAnalysis.components.length
									}
								/>
								<Metric
									label={
										isTraversal
											? text(language, "Tree edges", "Arêtes d’arbre")
											: algorithm === "components"
												? text(language, "Edges", "Arêtes")
												: text(language, "Selected edges", "Arêtes retenues")
									}
									value={
										isTraversal || algorithm === "components"
											? result.edges.length
											: `${result.edges.length} / ${Math.max(0, result.vertices.length - resultAnalysis.components.length)}`
									}
								/>
								{isTraversal && traversalStep && (
									<Metric
										label={text(language, "Discovered", "Découverts")}
										value={
											traversalStep.rows.filter(
												(row) => row.level !== null || row.entry !== null,
											).length
										}
									/>
								)}
								{algorithm === "kruskal" && (
									<Metric
										className="col-span-2"
										label={text(language, "Total weight", "Poids total")}
										value={weight}
									/>
								)}
							</dl>
							{isTraversal && (
								<div className="mt-3 border-t border-border pt-3 text-sm">
									<p className="text-xs text-muted-foreground">
										{algorithm === "bfs"
											? text(language, "Queue · FIFO", "File · FIFO")
											: text(
													language,
													"Active DFS branch",
													"Branche DFS active",
												)}
									</p>
									<p className="mt-1 break-words font-mono">
										{traversalStep?.frontier.length
											? `⟨${traversalStep.frontier.join(", ")}⟩`
											: "∅"}
									</p>
								</div>
							)}
						</aside>
					</div>
					<div className="grid gap-4 border-t border-border p-4 sm:p-5 @2xl:grid-cols-2">
						<section
							aria-labelledby="algorithm-pseudocode-title"
							className="min-w-0"
						>
							<h4
								id="algorithm-pseudocode-title"
								className="mb-3 text-xs font-semibold"
							>
								{text(
									language,
									"Pseudocode · executed line highlighted",
									"Pseudo-code · ligne exécutée surlignée",
								)}
							</h4>
							<ol className="space-y-1 font-mono text-[11px] leading-5">
								{pseudocode.map((line, lineIndex) => (
									<li
										key={line}
										aria-current={
											step?.codeLine === lineIndex + 1 ? "step" : undefined
										}
										className={`grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 rounded-md px-2 py-1 ${step?.codeLine === lineIndex + 1 ? "construction-item-active text-foreground" : "text-muted-foreground even:bg-muted/30"}`}
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
								{isTraversal
									? text(language, "Traversal state", "État du parcours")
									: text(
											language,
											"Component array · comp[x]",
											"Tableau des composantes · comp[x]",
										)}
							</h4>
							<p className="mb-2 text-[11px] text-muted-foreground">
								{isTraversal
									? algorithm === "bfs"
										? text(
												language,
												"Track each vertex’s parent and distance from its root.",
												"Suivez le parent de chaque sommet et sa distance à la racine.",
											)
										: text(
												language,
												"Track each vertex’s parent and entry and exit times.",
												"Suivez le parent et les dates d’entrée et de sortie de chaque sommet.",
											)
									: text(
											language,
											"Follow each vertex label as it is initialized and updated.",
											"Suivez l’initialisation et la mise à jour de l’étiquette de chaque sommet.",
										)}
							</p>
							<div className="max-h-80 overflow-auto rounded-lg border border-border">
								{isTraversal ? (
									<table className="w-full min-w-[300px] text-left font-mono text-xs">
										<thead className="sticky top-0 bg-muted text-muted-foreground">
											<tr>
												<th className="px-3 py-2 font-medium">
													{text(language, "Vertex", "Sommet")}
												</th>
												<th className="px-3 py-2 font-medium">
													{text(language, "Parent", "Parent")}
												</th>
												{algorithm === "bfs" ? (
													<th className="px-3 py-2 font-medium">
														{text(language, "Level", "Niveau")}
													</th>
												) : (
													<>
														<th className="px-3 py-2 font-medium">
															{text(language, "Entry", "Entrée")}
														</th>
														<th className="px-3 py-2 font-medium">
															{text(language, "Exit", "Sortie")}
														</th>
													</>
												)}
											</tr>
										</thead>
										<tbody>
											{traversalStep?.rows.map((row) => (
												<tr
													key={row.vertex}
													aria-current={
														traversalStep.currentVertex === row.vertex
															? "step"
															: undefined
													}
													className={`border-t border-border even:bg-muted/30 ${traversalStep.currentVertex === row.vertex ? "construction-item-active" : ""}`}
												>
													<th scope="row" className="px-3 py-1.5 font-medium">
														{row.vertex}
													</th>
													<td className="px-3 py-1.5">{row.parent ?? "—"}</td>
													{algorithm === "bfs" ? (
														<td className="px-3 py-1.5">{row.level ?? "∞"}</td>
													) : (
														<>
															<td className="px-3 py-1.5">
																{row.entry ?? "—"}
															</td>
															<td className="px-3 py-1.5">{row.exit ?? "—"}</td>
														</>
													)}
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<table className="w-full text-left font-mono text-xs">
										<thead className="sticky top-0 bg-muted text-muted-foreground">
											<tr>
												<th className="px-3 py-2 font-medium">
													{text(language, "Vertex", "Sommet")}
												</th>
												<th className="px-3 py-2 font-medium">comp[x]</th>
											</tr>
										</thead>
										<tbody>
											{componentLabels.map(([vertex, label]) => (
												<tr
													key={vertex}
													className={`border-t border-border even:bg-muted/30 ${step?.edge && (vertex === step.edge.first || vertex === step.edge.second) ? "construction-item-active" : ""}`}
												>
													<th scope="row" className="px-3 py-1.5 font-medium">
														{vertex}
													</th>
													<td className="px-3 py-1.5">{label}</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						</section>
					</div>
				</>
			)}
			<footer className="border-t border-border px-4 py-3 sm:px-5">
				<p className="text-xs text-muted-foreground">
					{text(language, "Algorithm complexity", "Complexité algorithmique")}
					<span className="ml-2 font-mono text-foreground">
						{isTraversal
							? "O(|V| + |E|)"
							: algorithm === "kruskal"
								? "O(|E| log |E| + |V|²)"
								: "O(|V|² + |E|)"}
					</span>
				</p>
			</footer>
		</div>
	);
}

function StepButton({
	disabled,
	onClick,
	children,
}: {
	disabled?: boolean;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className="min-h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-50"
		>
			{children}
		</button>
	);
}

function EdgeOrder({
	title,
	edges,
	highlighted,
}: {
	title: string;
	edges: Graph["edges"];
	highlighted?: Graph["edges"][number];
}) {
	return (
		<div className="min-w-0 rounded-xl border border-border bg-background p-3">
			<h4 className="mb-2 text-xs font-semibold">{title}</h4>
			<ol className="max-h-44 space-y-1 overflow-y-auto font-mono text-xs">
				{edges.map((edge, index) => (
					<li
						key={`${edge.first}-${edge.second}`}
						aria-current={edge === highlighted ? "step" : undefined}
						className={`flex items-center justify-between gap-3 rounded-md px-2 py-1.5 ${edge === highlighted ? "construction-item-active" : "even:bg-muted/40"}`}
					>
						<span className="flex min-w-0 items-center gap-3">
							<span className="w-4 shrink-0 text-right text-muted-foreground">
								{index + 1}
							</span>
							<span className="truncate">
								{edge.first} — {edge.second}
							</span>
						</span>
						<span className="shrink-0 rounded bg-muted px-2 py-1">
							{edge.weight ?? 1}
						</span>
					</li>
				))}
			</ol>
		</div>
	);
}

function Metric({
	label,
	value,
	className,
}: {
	label: string;
	value: string | number;
	className?: string;
}) {
	return (
		<div className={className}>
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="mt-1 font-mono">{value}</dd>
		</div>
	);
}

function describeStep(
	language: "en" | "fr",
	algorithm: SpanningAlgorithm,
	step: ReturnType<typeof buildSpanningSteps>[number] | undefined,
	pseudocode: string[],
) {
	if (!step)
		return text(
			language,
			"Run or Debug to follow the algorithm line by line.",
			"Lancez Exécuter ou Déboguer pour suivre chaque ligne de l’algorithme.",
		);
	if (!step.edge)
		return text(
			language,
			`Executing line ${step.codeLine}: ${pseudocode[step.codeLine - 1]}`,
			`Exécution de la ligne ${step.codeLine} : ${pseudocode[step.codeLine - 1]}`,
		);
	const conditionLine = algorithm === "kruskal" ? 5 : 4;
	if (step.codeLine !== conditionLine)
		return text(
			language,
			`Executing line ${step.codeLine}: ${pseudocode[step.codeLine - 1]}`,
			`Exécution de la ligne ${step.codeLine} : ${pseudocode[step.codeLine - 1]}`,
		);
	if (algorithm === "components")
		return step.accepted
			? text(
					language,
					"The endpoints have different labels; merge their components.",
					"Les extrémités ont des étiquettes différentes ; fusion des composantes.",
				)
			: text(
					language,
					"The endpoints already have the same label; no merge is needed.",
					"Les extrémités ont déjà la même étiquette ; aucune fusion nécessaire.",
				);
	return step.accepted
		? text(
				language,
				"The endpoints are in different components; keep this edge.",
				"Les extrémités sont dans des composantes différentes ; arête retenue.",
			)
		: text(
				language,
				"The endpoints are already connected; reject this edge because it would create a cycle.",
				"Les extrémités sont déjà reliées ; arête rejetée car elle créerait un cycle.",
			);
}

function describeTraversalStep(
	language: "en" | "fr",
	algorithm: TraversalAlgorithm,
	step: TraversalStep | undefined,
	pseudocode: string[],
) {
	if (!step)
		return text(
			language,
			"Run or Debug to follow the traversal line by line.",
			"Lancez ou déboguez le parcours pour suivre chaque ligne.",
		);
	if (step.edge && step.accepted !== undefined) {
		if (!step.accepted)
			return text(
				language,
				`Skip ${step.currentVertex ?? step.edge.second}; it has already been discovered.`,
				`Ignorez ${step.currentVertex ?? step.edge.second} : ce sommet a déjà été découvert.`,
			);
		if (
			(algorithm === "bfs" && step.codeLine === 9) ||
			(algorithm === "dfs" && step.codeLine === 8)
		)
			return text(
				language,
				`${step.currentVertex ?? step.edge.second} is undiscovered; continue the traversal.`,
				`${step.currentVertex ?? step.edge.second} n’a pas encore été découvert ; poursuivez le parcours.`,
			);
		if (algorithm === "bfs" && step.codeLine === 11)
			return text(
				language,
				`Enqueue ${step.currentVertex ?? step.edge.second} at the back of the queue.`,
				`Ajoutez ${step.currentVertex ?? step.edge.second} à la fin de la file.`,
			);
		if (algorithm === "dfs" && step.codeLine === 5)
			return text(
				language,
				`Enter ${step.currentVertex ?? step.edge.second} and push it onto the active stack.`,
				`Entrez dans ${step.currentVertex ?? step.edge.second} et empilez-le dans la pile active.`,
			);
		const discovered = step.currentVertex ?? step.edge.second;
		const parent = step.rows.find((row) => row.vertex === discovered)?.parent;
		return text(
			language,
			`Discover ${discovered} from ${parent ?? step.edge.first} and add this tree edge.`,
			`Découvrez ${discovered} depuis ${parent ?? step.edge.first} et ajoutez cette arête à l’arbre.`,
		);
	}
	if (step.currentVertex)
		return text(
			language,
			`Current vertex: ${step.currentVertex}.`,
			`Sommet courant : ${step.currentVertex}.`,
		);
	return text(
		language,
		`Executing line ${step.codeLine}: ${pseudocode[step.codeLine - 1]}`,
		`Exécution de la ligne ${step.codeLine} : ${pseudocode[step.codeLine - 1]}`,
	);
}
