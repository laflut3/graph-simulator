import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Graph, GraphEdge, GraphError, Vertex } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type GraphFormProps = {
	graph: Graph;
	onGraphNameChange: (name: string) => void;
	onAddVertex: (vertex: Vertex) => GraphError | null;
	onAddEdge: (
		first: Vertex,
		second: Vertex,
		weight?: number,
	) => GraphError | null;
	onGraphTypeChange: (
		patch: Partial<Pick<Graph, "directed" | "weighted">>,
	) => void;
	onRemoveVertex: (vertex: Vertex) => void;
	onRemoveEdge: (edge: GraphEdge) => void;
};

export function GraphForm({
	graph,
	onGraphNameChange,
	onGraphTypeChange,
	onAddVertex,
	onAddEdge,
	onRemoveVertex,
	onRemoveEdge,
}: GraphFormProps) {
	const [language] = useLanguage();
	const errorMessages: Record<GraphError, string> = {
		"invalid-vertex": text(
			language,
			"Enter a vertex name.",
			"Saisissez un nom de sommet.",
		),
		"duplicate-vertex": text(
			language,
			"That vertex already exists.",
			"Ce nom est déjà utilisé.",
		),
		"invalid-edge": text(
			language,
			"Choose two different vertices.",
			"Choisissez deux sommets différents.",
		),
		"invalid-weight": text(
			language,
			"Enter a valid numeric weight.",
			"Saisissez un poids numérique valide.",
		),
		"duplicate-edge": text(
			language,
			"That edge already exists.",
			"Cette arête existe déjà.",
		),
	};
	const { vertices, edges } = graph;
	const [vertexName, setVertexName] = useState("");
	const [edgeFirst, setEdgeFirst] = useState("");
	const [edgeSecond, setEdgeSecond] = useState("");
	const [edgeWeight, setEdgeWeight] = useState("1");
	const [vertexError, setVertexError] = useState("");
	const [edgeError, setEdgeError] = useState("");
	const [pendingType, setPendingType] = useState<Partial<
		Pick<Graph, "directed" | "weighted">
	> | null>(null);

	const firstValue = vertices.includes(edgeFirst)
		? edgeFirst
		: (vertices[0] ?? "");
	const choicesForSecond = graph.directed
		? vertices
		: vertices.filter((vertex) => vertex !== firstValue);
	const secondValue = choicesForSecond.includes(edgeSecond)
		? edgeSecond
		: (choicesForSecond[0] ?? "");

	function addVertex(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const error = onAddVertex(vertexName);
		setVertexError(error ? errorMessages[error] : "");
		if (!error) setVertexName("");
	}

	function addEdge(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const weight = edgeWeight.trim() === "" ? Number.NaN : Number(edgeWeight);
		const error = onAddEdge(
			firstValue,
			secondValue,
			graph.weighted ? weight : undefined,
		);
		setEdgeError(error ? errorMessages[error] : "");
	}

	return (
		<div>
			<div className="mb-6 grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2 sm:p-5">
				<label className="grid gap-2 text-sm font-medium">
					{text(language, "Orientation", "Orientation")}
					<select
						className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
						value={graph.directed ? "directed" : "undirected"}
						onChange={(event) =>
							setPendingType({ directed: event.target.value === "directed" })
						}
					>
						<option value="undirected">
							{text(language, "Undirected", "Non orienté")}
						</option>
						<option value="directed">
							{text(language, "Directed", "Orienté")}
						</option>
					</select>
				</label>
				<label className="grid gap-2 text-sm font-medium">
					{text(language, "Weights", "Pondération")}
					<select
						className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
						value={graph.weighted ? "weighted" : "unweighted"}
						onChange={(event) =>
							setPendingType({ weighted: event.target.value === "weighted" })
						}
					>
						<option value="unweighted">
							{text(language, "Unweighted", "Non pondéré")}
						</option>
						<option value="weighted">
							{text(language, "Weighted", "Pondéré")}
						</option>
					</select>
				</label>
			</div>
			{pendingType && (
				<div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
					<section
						role="dialog"
						aria-modal="true"
						aria-labelledby="graph-type-reset-title"
						className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
					>
						<h2 id="graph-type-reset-title" className="text-lg font-semibold">
							{text(language, "Reset graph?", "Réinitialiser le graphe ?")}
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							{text(
								language,
								"Changing the graph type restores the sample graph and default weights. Its name will be kept.",
								"Changer le type restaure le graphe d’exemple avec ses poids par défaut. Son nom sera conservé.",
							)}
						</p>
						<div className="mt-6 flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setPendingType(null)}
							>
								{text(language, "Cancel", "Annuler")}
							</Button>
							<Button
								type="button"
								onClick={() => {
									onGraphTypeChange(pendingType);
									setPendingType(null);
								}}
							>
								{text(language, "Reset and change", "Réinitialiser et changer")}
							</Button>
						</div>
					</section>
				</div>
			)}
			<div className="mb-5 max-w-xl">
				<label htmlFor="graph-name" className="mb-2 block text-sm font-medium">
					{text(language, "Graph name", "Nom du graphe")}
				</label>
				<Input
					id="graph-name"
					value={graph.nom}
					maxLength={64}
					placeholder={text(
						language,
						"e.g. Transit network",
						"Ex. Réseau de transport",
					)}
					onChange={(event) => onGraphNameChange(event.target.value)}
				/>
			</div>
			<div className="grid gap-5 lg:grid-cols-2">
				<section
					aria-labelledby="vertices-title"
					className="rounded-xl border border-border bg-muted/20 p-5 sm:p-6"
				>
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 id="vertices-title" className="text-lg font-medium">
								{text(language, "Vertices", "Sommets")}
							</h2>
						</div>
						<span className="rounded-full bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
							{vertices.length}
						</span>
					</div>
					<div className="mt-5 min-h-24 rounded-lg border border-border/70 bg-background p-4">
						<p className="mb-3 font-mono text-xs text-muted-foreground">
							V = &#123;{vertices.join(", ")}&#125;
						</p>
						{vertices.length ? (
							<ul className="flex flex-wrap gap-2">
								{vertices.map((vertex) => (
									<li
										key={vertex}
										className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 py-1 pl-3 pr-1 font-mono text-sm"
									>
										{vertex}
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											className="size-6 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
											aria-label={text(
												language,
												`Remove vertex ${vertex}`,
												`Supprimer le sommet ${vertex}`,
											)}
											onClick={() => onRemoveVertex(vertex)}
										>
											×
										</Button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">
								{text(language, "No vertices yet.", "Aucun sommet.")}
							</p>
						)}
					</div>
					<form className="mt-5" onSubmit={addVertex}>
						<label
							htmlFor="vertex-name"
							className="mb-2 block text-sm font-medium"
						>
							{text(language, "Add a vertex", "Ajouter un sommet")}
						</label>
						<div className="flex gap-2">
							<Input
								id="vertex-name"
								value={vertexName}
								onChange={(event) => setVertexName(event.target.value)}
								placeholder={text(
									language,
									"e.g. Start, A, 5",
									"Ex. Départ, A, 5",
								)}
								maxLength={32}
							/>
							<Button type="submit" className="rounded-md">
								{text(language, "Add", "Ajouter")}
							</Button>
						</div>
						<p
							className="mt-2 min-h-5 text-xs text-destructive"
							aria-live="polite"
						>
							{vertexError}
						</p>
					</form>
				</section>

				<section
					aria-labelledby="edges-title"
					className="rounded-xl border border-border bg-muted/20 p-5 sm:p-6"
				>
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 id="edges-title" className="text-lg font-medium">
								{text(language, "Edges", "Arêtes")}
							</h2>
						</div>
						<span className="rounded-full bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
							{edges.length}
						</span>
					</div>
					<div className="mt-5 min-h-24 rounded-lg border border-border/70 bg-background p-4">
						<p className="mb-3 font-mono text-xs text-muted-foreground">
							E = &#123;
							{edges
								.map(
									({ first, second, weight }) =>
										`${graph.directed ? `${first} → ${second}` : `{${first}, ${second}}`}${graph.weighted ? ` : ${weight ?? 1}` : ""}`,
								)
								.join(", ")}
							&#125;
						</p>
						{edges.length ? (
							<ul className="flex flex-wrap gap-2">
								{edges.map((edge) => (
									<li
										key={`${edge.first}:${edge.second}`}
										className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 py-1 pl-3 pr-1 font-mono text-sm"
									>
										{graph.directed
											? `${edge.first} → ${edge.second}`
											: `{${edge.first}, ${edge.second}}`}
										{graph.weighted ? ` : ${edge.weight ?? 1}` : ""}
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											className="size-6 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
											aria-label={text(
												language,
												`Remove edge ${edge.first}–${edge.second}`,
												`Supprimer l’arête ${edge.first}–${edge.second}`,
											)}
											onClick={() => onRemoveEdge(edge)}
										>
											×
										</Button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">
								{text(language, "No edges yet.", "Aucune arête.")}
							</p>
						)}
					</div>
					<form className="mt-5" onSubmit={addEdge}>
						<p className="mb-2 text-sm font-medium">
							{text(language, "Connect two vertices", "Relier deux sommets")}
						</p>
						<div
							className={`grid items-center gap-2 ${graph.weighted ? "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_5rem_auto]" : "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]"}`}
						>
							<select
								aria-label={text(language, "First vertex", "Premier sommet")}
								className="h-9 min-w-0 rounded-md border border-input bg-background px-3 text-sm"
								value={firstValue}
								onChange={(event) => setEdgeFirst(event.target.value)}
								disabled={vertices.length < 2}
							>
								{vertices.map((vertex) => (
									<option key={vertex} value={vertex}>
										{vertex}
									</option>
								))}
							</select>
							<span className="font-mono text-muted-foreground">
								{graph.directed ? "→" : "—"}
							</span>
							<select
								aria-label={text(language, "Second vertex", "Second sommet")}
								className="h-9 min-w-0 rounded-md border border-input bg-background px-3 text-sm"
								value={secondValue}
								onChange={(event) => setEdgeSecond(event.target.value)}
								disabled={vertices.length < 2}
							>
								{choicesForSecond.map((vertex) => (
									<option key={vertex} value={vertex}>
										{vertex}
									</option>
								))}
							</select>
							{graph.weighted && (
								<Input
									aria-label={text(language, "Edge weight", "Poids de l’arête")}
									type="number"
									step="any"
									value={edgeWeight}
									onChange={(event) => setEdgeWeight(event.target.value)}
									className="min-w-20"
								/>
							)}
							<Button
								type="submit"
								className="rounded-md"
								disabled={vertices.length < 2}
							>
								{text(language, "Add", "Ajouter")}
							</Button>
						</div>
						<p
							className="mt-2 min-h-5 text-xs text-destructive"
							aria-live="polite"
						>
							{edgeError}
						</p>
					</form>
				</section>
			</div>
		</div>
	);
}
