import { useEffect, useMemo, useState } from "react";
import { findShortestPaths } from "@/lib/graph/shortest-paths";
import type { Graph } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

export function ShortestPathFinder({ graph }: { graph: Graph }) {
	const [language] = useLanguage();
	const [source, setSource] = useState(graph.vertices[0] ?? "");
	const [destination, setDestination] = useState(
		graph.vertices[1] ?? graph.vertices[0] ?? "",
	);
	const results = useMemo(
		() => (source ? findShortestPaths(graph, source) : new Map()),
		[graph, source],
	);
	const result = results.get(destination);

	useEffect(() => {
		if (!graph.vertices.includes(source)) setSource(graph.vertices[0] ?? "");
		if (!graph.vertices.includes(destination))
			setDestination(graph.vertices[1] ?? graph.vertices[0] ?? "");
	}, [destination, graph, source]);

	return (
		<section
			aria-labelledby="shortest-path-finder-title"
			className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5"
		>
			<div>
				<h2 id="shortest-path-finder-title" className="text-sm font-medium">
					{text(
						language,
						"Find a shortest path",
						"Chercher un plus court chemin",
					)}
				</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					{graph.directed
						? text(
								language,
								"Paths follow the direction of each edge.",
								"Les chemins respectent le sens des arêtes.",
							)
						: text(
								language,
								"Choose any two vertices to see the shortest route between them.",
								"Choisissez deux sommets pour afficher le plus court chemin entre eux.",
							)}
				</p>
			</div>
			{graph.vertices.length ? (
				<>
					<div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
						<label className="grid gap-1.5 text-xs text-muted-foreground">
							{text(language, "From", "Départ")}
							<select
								value={source}
								onChange={(event) => setSource(event.target.value)}
								className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
							>
								{graph.vertices.map((vertex) => (
									<option key={vertex} value={vertex}>
										{vertex}
									</option>
								))}
							</select>
						</label>
						<span
							className="hidden pb-2 text-center text-muted-foreground sm:block"
							aria-hidden="true"
						>
							→
						</span>
						<label className="grid gap-1.5 text-xs text-muted-foreground">
							{text(language, "To", "Arrivée")}
							<select
								value={destination}
								onChange={(event) => setDestination(event.target.value)}
								className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
							>
								{graph.vertices.map((vertex) => (
									<option key={vertex} value={vertex}>
										{vertex}
									</option>
								))}
							</select>
						</label>
					</div>
					<div
						className="mt-4 rounded-lg border border-border bg-background px-3 py-3"
						aria-live="polite"
					>
						{result?.negativeCycle ? (
							<p className="text-sm text-destructive">
								{text(
									language,
									"No shortest path exists: a reachable negative cycle can reduce the route cost indefinitely.",
									"Aucun plus court chemin n’existe : un cycle négatif accessible peut diminuer indéfiniment le coût.",
								)}
							</p>
						) : result?.path ? (
							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
								<div className="min-w-0">
									<p className="text-xs text-muted-foreground">
										{text(language, "Shortest route", "Chemin le plus court")}
									</p>
									<p className="mt-1 break-words font-mono text-sm">
										{result.path.join(" → ")}
									</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground">
										{graph.weighted
											? text(language, "Total weight", "Poids total")
											: text(language, "Number of edges", "Nombre d’arêtes")}
									</p>
									<p className="mt-1 font-mono text-sm">{result.distance}</p>
								</div>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								{text(
									language,
									"No path connects these vertices.",
									"Aucun chemin ne relie ces sommets.",
								)}
							</p>
						)}
					</div>
				</>
			) : (
				<p className="mt-4 text-sm text-muted-foreground">
					{text(
						language,
						"Add vertices to find a path.",
						"Ajoutez des sommets pour chercher un chemin.",
					)}
				</p>
			)}
		</section>
	);
}
