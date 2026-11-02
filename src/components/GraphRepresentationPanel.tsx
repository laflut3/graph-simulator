import { useMemo } from "react";
import { AlgorithmComingSoon } from "@/components/AlgorithmComingSoon";
import {
	createAdjacencyMatrix,
	createNeighborLists,
	type GraphRepresentation,
	graphRepresentationName,
	representationComplexity,
	representationPseudocode,
} from "@/lib/graph/representations";
import type { Graph } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type Props = {
	graph: Graph;
	selected: GraphRepresentation;
	onSelect: (representation: GraphRepresentation) => void;
	onPlay: (representation: GraphRepresentation) => void;
	onDebug: (representation: GraphRepresentation) => void;
	execution?: {
		representation: GraphRepresentation;
		codeLine: number;
		currentVertex?: string;
		currentEdge?: Graph["edges"][number];
	};
};

const representations: GraphRepresentation[] = [
	"neighbor-list",
	"adjacency-matrix",
	"edge-list",
];

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

export function GraphRepresentationPanel({
	graph,
	selected,
	onSelect,
	onPlay,
	onDebug,
	execution,
}: Props) {
	const [language] = useLanguage();
	const vertices = graph.vertices;
	const edges = graph.edges;
	const matrix = useMemo(() => createAdjacencyMatrix(graph), [graph]);
	const neighbors = useMemo(() => createNeighborLists(graph), [graph]);
	const currentVertex = execution?.currentVertex;
	const currentEdge = execution?.currentEdge;
	const executedRepresentation = execution?.representation ?? selected;
	const pseudocode = representationPseudocode[language][
		executedRepresentation
	].map((line, index) => {
		if (executedRepresentation === "neighbor-list") {
			if (graph.directed && index === 4)
				return {
					...line,
					code:
						language === "en"
							? "  for each outgoing neighbor v of u:"
							: "  pour chaque voisin sortant v de u :",
				};
			if (graph.directed && index === 5)
				return {
					...line,
					code:
						language === "en"
							? "    if (u, v) is not processed:"
							: "    si (u, v) n’est pas traité :",
				};
			if ((graph.directed || graph.weighted) && index === 6)
				return {
					...line,
					code:
						language === "en"
							? `      add ${graph.directed ? "(u, v" : "{u, v"}${graph.weighted ? ", weight" : graph.directed ? ")" : "}"}${graph.weighted ? (graph.directed ? ")" : "}") : ""} to G'.E`
							: `      ajouter ${graph.directed ? "(u, v" : "{u, v"}${graph.weighted ? ", poids" : graph.directed ? ")" : "}"}${graph.weighted ? (graph.directed ? ")" : "}") : ""} à G'.E`,
				};
		}
		if (executedRepresentation === "edge-list") {
			if (graph.directed && index === 3)
				return {
					...line,
					code:
						language === "en"
							? "for each arc (u, v) in E:"
							: "pour chaque arc (u, v) de E :",
				};
			if ((graph.directed || graph.weighted) && index === 4)
				return {
					...line,
					code:
						language === "en"
							? `  add ${graph.directed ? "(u, v" : "{u, v"}${graph.weighted ? ", weight" : graph.directed ? ")" : "}"}${graph.weighted ? (graph.directed ? ")" : "}") : ""} to G'.E`
							: `  ajouter ${graph.directed ? "(u, v" : "{u, v"}${graph.weighted ? ", poids" : graph.directed ? ")" : "}"}${graph.weighted ? (graph.directed ? ")" : "}") : ""} à G'.E`,
				};
		}
		if (executedRepresentation !== "adjacency-matrix") return line;
		if (index === 4)
			return {
				...line,
				code: graph.directed
					? language === "en"
						? "  for each column j:"
						: "  pour chaque colonne j :"
					: language === "en"
						? "  for j from i + 1 to |V|:"
						: "  pour j de i + 1 à |V| :",
			};
		if (index === 5)
			return {
				...line,
				code: graph.weighted
					? language === "en"
						? "    if A[i, j] contains an edge weight:"
						: "    si A[i, j] contient un poids d’arête :"
					: language === "en"
						? "    if A[i, j] = 1:"
						: "    si A[i, j] = 1 :",
			};
		if ((graph.directed || graph.weighted) && index === 6)
			return {
				...line,
				code:
					language === "en"
						? `      add ${graph.directed ? "(vᵢ, vⱼ" : "{vᵢ, vⱼ"}${graph.weighted ? ", weight" : graph.directed ? ")" : "}"}${graph.weighted ? (graph.directed ? ")" : "}") : ""} to G'.E`
						: `      ajouter ${graph.directed ? "(vᵢ, vⱼ" : "{vᵢ, vⱼ"}${graph.weighted ? ", poids" : graph.directed ? ")" : "}"}${graph.weighted ? (graph.directed ? ")" : "}") : ""} à G'.E`,
			};
		return line;
	});
	const isCurrentEdge = (first: string, second: string) =>
		currentEdge !== undefined &&
		((currentEdge.first === first && currentEdge.second === second) ||
			(!graph.directed &&
				currentEdge.first === second &&
				currentEdge.second === first));

	return (
		<section
			aria-labelledby="representation-title"
			className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm"
		>
			<header className="space-y-4 border-b border-border bg-muted/20 p-4 sm:p-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h3 id="representation-title" className="text-sm font-semibold">
						{text(language, "Representation", "Représentation")}
					</h3>
					<AlgorithmComingSoon />
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<nav
						aria-label={text(
							language,
							"Graph representations",
							"Représentations du graphe",
						)}
						className="flex flex-wrap gap-2"
					>
						{representations.map((representation) => {
							const label =
								representation === "neighbor-list"
									? text(language, "Neighbors", "Voisins")
									: representation === "adjacency-matrix"
										? text(language, "Matrix", "Matrice")
										: text(language, "Edges", "Arêtes");
							const active = selected === representation;
							return (
								<div
									key={representation}
									className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-background p-1 shadow-sm"
								>
									<button
										type="button"
										aria-pressed={active}
										onClick={() => onSelect(representation)}
										className={`h-9 rounded-lg px-3 text-xs font-medium transition-colors ${active ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
									>
										{label}
									</button>
									<button
										type="button"
										aria-label={text(
											language,
											`Run ${graphRepresentationName(representation, language)}`,
											`Lancer ${graphRepresentationName(representation, language)}`,
										)}
										title={text(
											language,
											`Run ${graphRepresentationName(representation, language)}`,
											`Lancer ${graphRepresentationName(representation, language)}`,
										)}
										onClick={() => onPlay(representation)}
										className="grid size-9 place-items-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
									>
										<svg
											aria-hidden="true"
											viewBox="0 0 16 16"
											fill="currentColor"
											className="size-4"
										>
											<path d="M4.25 2.75a.75.75 0 0 1 1.12-.65l8 4.75a.75.75 0 0 1 0 1.3l-8 4.75a.75.75 0 0 1-1.12-.65z" />
										</svg>
									</button>
									<button
										type="button"
										aria-label={text(
											language,
											`Debug ${graphRepresentationName(representation, language)} step by step`,
											`Déboguer ${graphRepresentationName(representation, language)} pas à pas`,
										)}
										title={text(
											language,
											"Debug step by step",
											"Déboguer pas à pas",
										)}
										onClick={() => onDebug(representation)}
										className="grid size-9 place-items-center rounded-lg border border-blue-500/15 bg-blue-500/5 text-blue-600 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-400/10"
									>
										<DebugBugIcon />
									</button>
								</div>
							);
						})}
					</nav>
				</div>
			</header>

			<div className="min-h-52 p-4 sm:p-5">
				<p className="mb-3 font-mono text-xs text-muted-foreground">
					{graphRepresentationName(selected, language)}
				</p>
				{selected === "neighbor-list" && (
					<ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
						{vertices.map((vertex) => (
							<li
								key={vertex}
								aria-current={currentVertex === vertex ? "step" : undefined}
								className={`flex min-w-0 gap-2 rounded-md px-2 py-1.5 even:bg-muted/40 ${currentVertex === vertex ? "construction-item-active" : ""}`}
							>
								<span
									className={`min-w-12 truncate font-mono font-medium ${currentVertex === vertex ? "text-[var(--construction-active)]" : ""}`}
								>
									{vertex}
								</span>
								<span className="break-all text-muted-foreground">
									{neighbors.get(vertex)?.length ? (
										<>
											&#123;
											{neighbors.get(vertex)?.map((neighbor, index) => (
												<span key={neighbor}>
													{index > 0 && ", "}
													<span
														aria-current={
															isCurrentEdge(vertex, neighbor)
																? "step"
																: undefined
														}
														className={
															isCurrentEdge(vertex, neighbor)
																? "rounded-sm bg-blue-500/15 px-0.5 text-[var(--construction-active)]"
																: ""
														}
													>
														{neighbor}
														{graph.weighted
															? ` (${graph.edges.find((edge) => (graph.directed ? edge.first === vertex && edge.second === neighbor : (edge.first === vertex && edge.second === neighbor) || (edge.first === neighbor && edge.second === vertex)))?.weight ?? 1})`
															: ""}
													</span>
												</span>
											))}
											&#125;
										</>
									) : (
										"∅"
									)}
								</span>
							</li>
						))}
					</ul>
				)}
				{selected === "adjacency-matrix" && (
					<div className="max-h-80 overflow-auto rounded-md border border-border">
						<table className="w-full border-collapse text-center font-mono text-xs">
							<caption className="sr-only">
								{text(language, "Adjacency matrix", "Matrice d’adjacence")}
							</caption>
							<thead className="sticky top-0 bg-muted">
								<tr>
									<th scope="col" className="sticky left-0 bg-muted px-2 py-2">
										·
									</th>
									{vertices.map((vertex) => (
										<th
											scope="col"
											key={vertex}
											className={`min-w-8 px-2 py-2 font-medium ${currentVertex === vertex || currentEdge?.first === vertex || currentEdge?.second === vertex ? "construction-item-active" : ""}`}
										>
											{vertex}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{vertices.map((vertex, row) => (
									<tr key={vertex} className="border-t border-border">
										<th
											scope="row"
											aria-current={
												currentVertex === vertex ||
												currentEdge?.first === vertex ||
												currentEdge?.second === vertex
													? "step"
													: undefined
											}
											className={`sticky left-0 bg-muted/80 px-2 py-2 font-medium ${currentVertex === vertex || currentEdge?.first === vertex || currentEdge?.second === vertex ? "construction-item-active" : ""}`}
										>
											{vertex}
										</th>
										{matrix[row].map((value, column) => {
											const columnVertex = vertices[column];
											const currentCell =
												columnVertex !== undefined &&
												isCurrentEdge(vertex, columnVertex);
											const currentVertexCell =
												currentEdge === undefined &&
												currentVertex === vertex &&
												currentVertex === columnVertex;
											return (
												<td
													key={`${vertex}-${columnVertex}`}
													aria-current={
														currentCell || currentVertexCell
															? "step"
															: undefined
													}
													className={`px-2 py-2 ${currentCell || currentVertexCell ? "construction-item-active" : value !== null ? "font-semibold text-foreground" : "text-muted-foreground/60"}`}
												>
													{value ?? (graph.weighted ? "∞" : 0)}
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{selected === "edge-list" && (
					<ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
						{edges.length ? (
							edges.map(({ first, second, weight }, index) => (
								<li
									key={`${first}-${second}`}
									aria-current={
										isCurrentEdge(first, second) ? "step" : undefined
									}
									className={`flex gap-3 rounded-md px-2 py-1.5 even:bg-muted/40 ${isCurrentEdge(first, second) ? "construction-item-active" : ""}`}
								>
									<span className="font-mono text-muted-foreground">
										{index + 1}.
									</span>
									<span className="font-mono">
										{graph.directed
											? `${first} → ${second}`
											: `{${first}, ${second}}`}
										{graph.weighted ? ` : ${weight ?? 1}` : ""}
									</span>
								</li>
							))
						) : (
							<li className="py-4 text-center text-xs text-muted-foreground">
								{text(language, "No edges.", "Aucune arête.")}
							</li>
						)}
					</ol>
				)}
			</div>
			{execution && (
				<section
					aria-label={text(
						language,
						"Execution pseudocode",
						"Pseudo-code de l’exécution",
					)}
					className="border-t border-border px-4 py-4 sm:px-5"
				>
					<div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
						<h4 className="text-xs font-medium">
							{text(language, "Pseudocode", "Pseudo-code")}
						</h4>
					</div>
					<ol className="max-h-48 space-y-0.5 overflow-auto rounded-lg bg-muted/30 p-2 font-mono text-[11px]">
						{pseudocode.map(({ id, code }, index) => (
							<li
								key={`${execution.representation}-${id}`}
								aria-current={index === execution.codeLine ? "step" : undefined}
								className={`rounded px-2 py-1 ${index === execution.codeLine ? "construction-code-active" : "text-muted-foreground"}`}
							>
								<span className="mr-3 inline-block w-4 text-right opacity-60">
									{index + 1}
								</span>
								<code className="whitespace-pre">{code}</code>
							</li>
						))}
					</ol>
				</section>
			)}

			<footer className="border-t border-border px-4 py-3 sm:px-5">
				<p className="text-xs text-muted-foreground">
					{text(language, "Time complexity", "Complexité algorithmique")}
					<span className="ml-2 font-mono text-foreground">
						{representationComplexity[selected]}
					</span>
				</p>
			</footer>
		</section>
	);
}
