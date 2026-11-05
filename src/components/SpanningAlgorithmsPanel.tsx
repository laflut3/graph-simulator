import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { analyzeGraph } from "@/lib/graph/analyze";
import {
	buildSpanningSteps,
	getSpanningPseudocode,
	type SpanningAlgorithm,
	sortEdgesByWeight,
} from "@/lib/graph/spanning";
import type { Graph } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type Props = {
	graph: Graph;
	onDisplayGraph: (graph: Graph | null) => void;
};

export function SpanningAlgorithmsPanel({ graph, onDisplayGraph }: Props) {
	const [language] = useLanguage();
	const [algorithm, setAlgorithm] = useState<SpanningAlgorithm>(() =>
		graph.weighted ? "kruskal" : "components",
	);
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
	const sortedEdges = useMemo(() => sortEdgesByWeight(graph), [graph]);
	const inputAnalysis = useMemo(() => analyzeGraph(graph), [graph]);
	const inputConnected =
		graph.vertices.length === 0 || inputAnalysis.components.length === 1;
	const componentLabels =
		step?.componentLabels ?? graph.vertices.map((vertex) => [vertex, "—"]);
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
	const names: Record<SpanningAlgorithm, string> = {
		components: text(
			language,
			"Connected components · comp[x]",
			"Composantes connexes · comp[x]",
		),
		"spanning-tree": text(language, "Spanning forest", "Forêt couvrante"),
		kruskal: text(language, "Kruskal", "Kruskal"),
	};

	useEffect(() => {
		onDisplayGraph(result);
	}, [onDisplayGraph, result]);
	useEffect(() => () => onDisplayGraph(null), [onDisplayGraph]);
	useEffect(() => {
		setAlgorithm(graph.weighted ? "kruskal" : "components");
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
	const setAlgorithmAndReset = (value: SpanningAlgorithm) => {
		setAlgorithm(value);
		setIndex(-1);
		setExecutionMode("idle");
	};

	return (
		<div className="min-w-0">
			<header className="space-y-3 border-b border-border bg-muted/20 p-4 sm:p-5">
				<div>
					<h3 className="text-sm font-semibold">
						{text(language, "Graph algorithms", "Algorithmes de graphes")}
					</h3>
					<p className="mt-1 text-xs text-muted-foreground">
						{algorithm === "components"
							? text(
									language,
									"Update comp[x] after every edge to identify connected components.",
									"Mettez à jour comp[x] après chaque arête pour identifier les composantes connexes.",
								)
							: text(
									language,
									"Keep every vertex and add edges only when they join different components.",
									"Conservez tous les sommets et ajoutez une arête seulement si elle relie deux composantes.",
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

				<div className="flex flex-wrap items-center gap-2">
					<label className="sr-only" htmlFor="spanning-algorithm">
						{text(language, "Algorithm", "Algorithme")}
					</label>
					<select
						id="spanning-algorithm"
						value={algorithm}
						onChange={(event) =>
							setAlgorithmAndReset(event.target.value as SpanningAlgorithm)
						}
						className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm sm:max-w-xs"
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
					</select>
					<button
						type="button"
						className="min-h-10 rounded-lg bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
						disabled={
							graph.directed ||
							(algorithm !== "components" && !graph.edges.length)
						}
						onClick={startRun}
					>
						{text(language, "Run", "Exécuter")}
					</button>
					<button
						type="button"
						className="min-h-10 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 text-sm text-blue-700 hover:bg-blue-500/10 dark:text-blue-300 disabled:opacity-50"
						aria-pressed={executionMode === "debug"}
						disabled={
							graph.directed ||
							(algorithm !== "components" && !graph.edges.length)
						}
						onClick={() => setExecutionMode("debug")}
					>
						{text(language, "Debug", "Déboguer")}
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

			{graph.directed ? (
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
							className="grid gap-4 border-b border-border p-4 sm:grid-cols-2 sm:p-5"
							aria-label={text(
								language,
								"Kruskal edge sorting",
								"Tri des arêtes de Kruskal",
							)}
						>
							<EdgeOrder
								title={text(language, "Before sorting", "Avant le tri")}
								edges={graph.edges}
							/>
							<EdgeOrder
								title={text(
									language,
									"After sorting · increasing weight",
									"Après le tri · poids croissant",
								)}
								edges={sortedEdges}
							/>
						</section>
					)}
					<div className="grid gap-4 p-4 sm:p-5">
						<div className="min-w-0">
							<div
								className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
								aria-live="polite"
							>
								<span>
									{index < 0
										? text(language, "Ready to execute.", "Prêt à exécuter.")
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
								{describeStep(language, algorithm, step, pseudocode)}
							</p>
						</div>
						<aside className="rounded-xl border border-border bg-background p-4">
							<h3 className="text-sm font-medium">
								{algorithm === "components"
									? text(
											language,
											"Connected components",
											"Composantes connexes",
										)
									: complete && inputConnected
										? text(language, "Spanning tree", "Arbre couvrant")
										: text(language, "Current subgraph", "Sous-graphe courant")}
							</h3>
							<p className="mt-1 text-xs text-muted-foreground">
								{algorithm === "components"
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
							<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
								<Metric
									label={text(language, "Components", "Composantes")}
									value={resultAnalysis.components.length}
								/>
								<Metric
									label={
										algorithm === "components"
											? text(language, "Edges", "Arêtes")
											: text(language, "Selected edges", "Arêtes retenues")
									}
									value={
										algorithm === "components"
											? result.edges.length
											: `${result.edges.length} / ${Math.max(0, result.vertices.length - resultAnalysis.components.length)}`
									}
								/>
								{algorithm === "kruskal" && (
									<Metric
										className="col-span-2"
										label={text(language, "Total weight", "Poids total")}
										value={weight}
									/>
								)}
							</dl>
						</aside>
					</div>
					<div className="grid gap-4 border-t border-border p-4 sm:p-5 lg:grid-cols-2">
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
									"Component array · comp[x]",
									"Tableau des composantes · comp[x]",
								)}
							</h4>
							<p className="mb-2 text-[11px] text-muted-foreground">
								{text(
									language,
									"Follow each vertex label as it is initialized and updated.",
									"Suivez l’initialisation et la mise à jour de l’étiquette de chaque sommet.",
								)}
							</p>
							<div className="max-h-44 overflow-auto rounded-lg border border-border">
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
			<footer className="border-t border-border px-4 py-3 sm:px-5">
				<p className="text-xs text-muted-foreground">
					{text(language, "Algorithm complexity", "Complexité algorithmique")}
					<span className="ml-2 font-mono text-foreground">
						{algorithm === "kruskal"
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

function EdgeOrder({ title, edges }: { title: string; edges: Graph["edges"] }) {
	return (
		<div className="min-w-0">
			<h4 className="mb-2 text-xs font-semibold">{title}</h4>
			<ol className="max-h-36 space-y-1 overflow-y-auto font-mono text-xs">
				{edges.map((edge, index) => (
					<li
						key={`${edge.first}-${edge.second}`}
						className="flex justify-between gap-3"
					>
						<span>
							{index + 1}. {edge.first} — {edge.second}
						</span>
						<span>{edge.weight ?? 1}</span>
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
