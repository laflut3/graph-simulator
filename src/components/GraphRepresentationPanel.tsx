import { useMemo } from "react";
import { AlgorithmComingSoon } from "@/components/AlgorithmComingSoon";
import {
	createAdjacencyMatrix,
	createNeighborLists,
	type GraphRepresentation,
	graphRepresentationName,
	representationComplexity,
} from "@/lib/graph/representations";
import type { Graph } from "@/lib/graph/types";

type Props = {
	graph: Graph;
	selected: GraphRepresentation;
	onSelect: (representation: GraphRepresentation) => void;
};

const representations: GraphRepresentation[] = [
	"neighbor-list",
	"adjacency-matrix",
	"edge-list",
];

export function GraphRepresentationPanel({ graph, selected, onSelect }: Props) {
	const vertices = graph.vertices;
	const edges = graph.edges;
	const matrix = useMemo(
		() => createAdjacencyMatrix({ vertices, edges }),
		[vertices, edges],
	);
	const neighbors = useMemo(
		() => createNeighborLists({ vertices, edges }),
		[vertices, edges],
	);
	const complexity = representationComplexity[selected];

	return (
		<section
			aria-labelledby="representation-title"
			className="min-w-0 rounded-xl border border-border bg-muted/10"
		>
			<header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
				<div>
					<h3 id="representation-title" className="text-sm font-medium">
						Représentation du graphe
					</h3>
					<p className="mt-1 text-xs text-muted-foreground">
						Choisissez une vue du graphe.
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-end gap-2">
					<div className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-1">
						{representations.map((representation) => (
							<button
								key={representation}
								type="button"
								aria-pressed={selected === representation}
								onClick={() => onSelect(representation)}
								className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${selected === representation ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
							>
								{representation === "neighbor-list"
									? "Voisins"
									: representation === "adjacency-matrix"
										? "Matrice"
										: "Arêtes"}
							</button>
						))}
					</div>
					<AlgorithmComingSoon />
				</div>
			</header>

			<div className="min-h-52 p-4 sm:p-5">
				<p className="mb-3 font-mono text-xs text-muted-foreground">
					{graphRepresentationName(selected)}
				</p>
				{selected === "neighbor-list" && (
					<ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
						{graph.vertices.map((vertex) => (
							<li
								key={vertex}
								className="flex min-w-0 gap-2 rounded-md px-2 py-1.5 even:bg-muted/40"
							>
								<span className="min-w-12 truncate font-mono font-medium">
									{vertex}
								</span>
								<span className="break-all text-muted-foreground">
									{neighbors.get(vertex)?.length
										? `{${neighbors.get(vertex)?.join(", ")}}`
										: "∅"}
								</span>
							</li>
						))}
					</ul>
				)}
				{selected === "adjacency-matrix" && (
					<div className="max-h-80 overflow-auto rounded-md border border-border">
						<table className="w-full border-collapse text-center font-mono text-xs">
							<caption className="sr-only">Matrice d’adjacence</caption>
							<thead className="sticky top-0 bg-muted">
								<tr>
									<th scope="col" className="sticky left-0 bg-muted px-2 py-2">
										·
									</th>
									{graph.vertices.map((vertex) => (
										<th
											scope="col"
											key={vertex}
											className="min-w-8 px-2 py-2 font-medium"
										>
											{vertex}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{graph.vertices.map((vertex, row) => (
									<tr key={vertex} className="border-t border-border">
										<th
											scope="row"
											className="sticky left-0 bg-muted/80 px-2 py-2 font-medium"
										>
											{vertex}
										</th>
										{matrix[row].map((value, column) => (
											<td
												key={`${vertex}-${graph.vertices[column]}`}
												className={`px-2 py-2 ${value ? "font-semibold text-foreground" : "text-muted-foreground/60"}`}
											>
												{value}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{selected === "edge-list" && (
					<ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
						{graph.edges.length ? (
							graph.edges.map(({ first, second }, index) => (
								<li
									key={`${first}-${second}`}
									className="flex gap-3 rounded-md px-2 py-1.5 even:bg-muted/40"
								>
									<span className="font-mono text-muted-foreground">
										{index + 1}.
									</span>
									<span className="font-mono">
										&#123;{first}, {second}&#125;
									</span>
								</li>
							))
						) : (
							<li className="py-4 text-center text-xs text-muted-foreground">
								Aucune arête dans le graphe.
							</li>
						)}
					</ol>
				)}
			</div>

			<footer className="border-t border-border px-4 py-3 sm:px-5">
				<div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
					<ComplexityItem label="Mémoire" value={complexity.space} />
					<ComplexityItem
						label="Tester l’adjacence"
						value={complexity.testAdjacency}
					/>
					<ComplexityItem
						label="Lister les voisins"
						value={complexity.listNeighbors}
					/>
					<ComplexityItem
						label="Lister les arêtes"
						value={complexity.listEdges}
					/>
				</div>
				{selected === "adjacency-matrix" && (
					<p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
						La matrice est symétrique, sa diagonale est nulle et chaque ligne
						somme au degré du sommet.
					</p>
				)}
				{selected === "neighbor-list" && (
					<p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
						Chaque arête apparaît dans les listes de ses deux extrémités.
					</p>
				)}
			</footer>
		</section>
	);
}

function ComplexityItem({ label, value }: { label: string; value: string }) {
	return (
		<p className="text-muted-foreground">
			{label}
			<span className="mt-1 block font-mono text-foreground">{value}</span>
		</p>
	);
}
