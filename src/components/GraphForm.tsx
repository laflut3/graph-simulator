import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Graph, GraphEdge, GraphError, Vertex } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type GraphFormProps = {
	graph: Graph;
	onGraphNameChange: (name: string) => void;
	onAddVertex: (vertex: Vertex) => GraphError | null;
	onAddEdge: (first: Vertex, second: Vertex) => GraphError | null;
	onRemoveVertex: (vertex: Vertex) => void;
	onRemoveEdge: (edge: GraphEdge) => void;
};

export function GraphForm({
	graph,
	onGraphNameChange,
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
	const [vertexError, setVertexError] = useState("");
	const [edgeError, setEdgeError] = useState("");

	const firstValue = vertices.includes(edgeFirst)
		? edgeFirst
		: (vertices[0] ?? "");
	const choicesForSecond = vertices.filter((vertex) => vertex !== firstValue);
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
		const error = onAddEdge(firstValue, secondValue);
		setEdgeError(error ? errorMessages[error] : "");
	}

	return (
		<div>
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
								.map(({ first, second }) => `{${first}, ${second}}`)
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
										&#123;{edge.first}, {edge.second}&#125;
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
						<div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
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
							<span className="font-mono text-muted-foreground">—</span>
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
