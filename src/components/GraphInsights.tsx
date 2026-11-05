import { useMemo } from "react";
import type { GraphAnalysis } from "@/lib/graph/analyze";
import {
	findShortestPaths,
	type ShortestPathResult,
} from "@/lib/graph/shortest-paths";
import type { Graph, Vertex } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type Props = {
	graph: Graph;
	analysis: GraphAnalysis;
	selectedVertex: Vertex | null;
	onSelectVertex: (vertex: Vertex | null) => void;
};

export function GraphInsights({
	graph,
	analysis,
	selectedVertex,
	onSelectVertex,
}: Props) {
	const [language] = useLanguage();
	const shortestPaths = useMemo(
		() =>
			selectedVertex
				? findShortestPaths(graph, selectedVertex)
				: new Map<Vertex, ShortestPathResult>(),
		[graph, selectedVertex],
	);
	const { directed, vertices, edges } = graph;
	const isAcyclic =
		analysis.cycles.length === 0 &&
		!edges.some((edge) => edge.first === edge.second);
	const isTree =
		!directed &&
		vertices.length > 0 &&
		isAcyclic &&
		analysis.components.length === 1;
	const isForest = !directed && isAcyclic;
	const componentIndex = analysis.components.findIndex((component) =>
		component.includes(selectedVertex ?? ""),
	);
	const selectedComponent = analysis.components[componentIndex] ?? [];
	const cyclesForVertex = analysis.cycles.filter((cycle) =>
		cycle.includes(selectedVertex ?? ""),
	);
	const listVertices = (vertices: Vertex[]) => vertices.join(", ");

	return (
		<div className="-mx-4 mt-16 mb-16 grid gap-3 px-4 md:grid-cols-2 sm:-mx-8 sm:px-8 sm:mt-20 sm:mb-20 lg:-mx-10 lg:px-10">
			<section
				aria-label={text(
					language,
					directed ? "Weakly connected components" : "Connected components",
					directed ? "Composantes connexes faibles" : "Composantes connexes",
				)}
				className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5"
			>
				<div className="flex items-baseline justify-between gap-3">
					<h2 className="text-sm font-medium">
						{text(
							language,
							directed ? "Weakly connected components" : "Connected components",
							directed
								? "Composantes connexes faibles"
								: "Composantes connexes",
						)}
					</h2>
					<span className="font-mono text-xs text-muted-foreground">
						{analysis.components.length}
					</span>
				</div>
				<ul className="mt-3 max-h-36 space-y-1.5 overflow-y-auto text-sm text-muted-foreground">
					{analysis.components.map((component, index) => (
						<li
							key={JSON.stringify(component)}
							className={`break-words ${
								index === componentIndex ? "font-medium text-foreground" : ""
							}`}
						>
							<span className="mr-2 font-mono text-xs">C{index + 1}</span>
							&#123;{listVertices(component)}&#125;
						</li>
					))}
				</ul>
			</section>
			<section
				aria-label={text(language, "Simple cycles", "Cycles simples")}
				className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5"
			>
				<div className="flex items-baseline justify-between gap-3">
					<h2 className="text-sm font-medium">
						{text(language, "Simple cycles", "Cycles simples")}
					</h2>
					<span className="font-mono text-xs text-muted-foreground">
						{analysis.cycles.length}
					</span>
				</div>
				{analysis.cycles.length ? (
					<ul className="mt-3 max-h-36 space-y-1.5 overflow-y-auto text-sm text-muted-foreground">
						{analysis.cycles.map((cycle) => (
							<li
								key={JSON.stringify(cycle)}
								className={`break-words ${
									cyclesForVertex.includes(cycle)
										? "font-medium text-foreground"
										: ""
								}`}
							>
								{cycle.join(" → ")} → {cycle[0]}
							</li>
						))}
					</ul>
				) : (
					<p className="mt-3 text-sm text-muted-foreground">
						{text(
							language,
							"No cycles in this graph.",
							"Aucun cycle dans ce graphe.",
						)}
					</p>
				)}
			</section>
			<section
				aria-label={text(language, "Graph structure", "Structure du graphe")}
				className="col-span-full rounded-xl border border-border bg-muted/20 p-4 sm:p-5"
			>
				<h2 className="text-sm font-medium">
					{text(language, "Graph structure", "Structure du graphe")}
				</h2>
				<div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
					<StructureProperty
						label={text(language, "Tree", "Arbre")}
						value={directed ? null : isTree}
						language={language}
					/>
					<StructureProperty
						label={text(language, "Forest", "Forêt")}
						value={directed ? null : isForest}
						language={language}
					/>
					<StructureProperty
						label={text(language, "Spanning vertices", "Sommets couvrants")}
						value={true}
						detail={text(
							language,
							"All vertices in this graph are included.",
							"Tous les sommets du graphe analysé sont présents.",
						)}
						language={language}
					/>
					<StructureProperty
						label={text(language, "Spanning tree", "Arbre couvrant")}
						value={directed ? null : isTree}
						detail={text(
							language,
							"A spanning tree keeps every vertex and has no cycles.",
							"Un arbre couvrant conserve tous les sommets et ne contient aucun cycle.",
						)}
						language={language}
					/>
				</div>
			</section>

			{selectedVertex !== null && (
				<section
					aria-live="polite"
					className="col-span-full rounded-xl border border-primary/30 bg-background p-4 sm:p-5"
				>
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 className="text-lg font-medium">{selectedVertex}</h2>
						</div>
						<button
							type="button"
							onClick={() => onSelectVertex(null)}
							className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
							aria-label={text(
								language,
								"Close vertex details",
								"Fermer les détails du sommet",
							)}
						>
							×
						</button>
					</div>
					<div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
						<div>
							<p className="text-xs text-muted-foreground">
								{text(
									language,
									directed ? "In-degree / out-degree" : "Degree",
									directed ? "Degré entrant / sortant" : "Degré",
								)}
							</p>
							<p className="mt-1 break-words">
								{directed
									? `${analysis.inDegree.get(selectedVertex) ?? 0} / ${analysis.outDegree.get(selectedVertex) ?? 0}`
									: (analysis.degree.get(selectedVertex) ?? 0)}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">
								{text(
									language,
									`Component C${componentIndex + 1}`,
									`Composante C${componentIndex + 1}`,
								)}
							</p>
							<p className="mt-1 break-words">
								&#123;{listVertices(selectedComponent)}&#125;
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">
								{text(
									language,
									"Cycles containing this vertex",
									"Cycles contenant ce sommet",
								)}
							</p>
							<p className="mt-1">
								{cyclesForVertex.length
									? cyclesForVertex
											.map((cycle) => `${cycle.join(" → ")} → ${cycle[0]}`)
											.join(" ; ")
									: text(language, "None", "Aucun")}
							</p>
						</div>
					</div>
					<div className="mt-5 border-t border-border pt-4">
						<h3 className="text-sm font-medium">
							{text(
								language,
								`Shortest paths from ${selectedVertex}`,
								`Plus courts chemins depuis ${selectedVertex}`,
							)}
						</h3>
						<div className="mt-3 overflow-x-auto rounded-lg border border-border">
							<table className="w-full min-w-[32rem] text-left text-sm">
								<caption className="sr-only">
									{text(
										language,
										`Shortest paths from ${selectedVertex} to every vertex`,
										`Plus courts chemins de ${selectedVertex} vers chaque sommet`,
									)}
								</caption>
								<thead className="bg-muted/60 text-xs text-muted-foreground">
									<tr>
										<th scope="col" className="px-3 py-2 font-medium">
											{text(language, "Destination", "Destination")}
										</th>
										<th scope="col" className="px-3 py-2 font-medium">
											{graph.weighted
												? text(language, "Total weight", "Poids total")
												: text(language, "Number of edges", "Nombre d’arêtes")}
										</th>
										<th scope="col" className="px-3 py-2 font-medium">
											{text(language, "Shortest path", "Chemin le plus court")}
										</th>
									</tr>
								</thead>
								<tbody>
									{vertices.map((vertex) => {
										const route = shortestPaths.get(vertex);
										return (
											<tr
												key={vertex}
												className="border-t border-border even:bg-muted/20"
											>
												<th
													scope="row"
													className="whitespace-nowrap px-3 py-2 font-medium"
												>
													{vertex}
												</th>
												<td className="whitespace-nowrap px-3 py-2 font-mono">
													{route?.negativeCycle
														? "−∞"
														: (route?.distance ??
															text(language, "Unreachable", "Inaccessible"))}
												</td>
												<td className="break-words px-3 py-2 text-muted-foreground">
													{route?.negativeCycle
														? text(
																language,
																"Affected by a reachable negative cycle",
																"Affecté par un cycle négatif accessible",
															)
														: route?.paths.length
															? route.paths.length > 1
																? route.paths.map((path) => (
																		<p key={path.join(" → ")}>
																			{path.join(" → ")}
																		</p>
																	))
																: route.path?.join(" → ")
															: text(language, "No path", "Aucun chemin")}
													{route?.pathsTruncated && (
														<p className="mt-1 text-xs">
															{text(
																language,
																"First 100 routes shown.",
																"100 premiers chemins affichés.",
															)}
														</p>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}

function StructureProperty({
	label,
	value,
	detail,
	language,
}: {
	label: string;
	value: boolean | null;
	detail?: string;
	language: "en" | "fr";
}) {
	return (
		<div className="min-w-0">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="mt-1 font-medium">
				{value === null
					? text(
							language,
							"Not applicable to directed graphs",
							"Non défini pour un graphe orienté",
						)
					: value
						? text(language, "Yes", "Oui")
						: text(language, "No", "Non")}
			</p>
			{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
		</div>
	);
}
