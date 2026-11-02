import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Graph, GraphEdge, GraphError, Vertex } from "@/lib/graph/types";

type GraphFormProps = {
	graph: Graph;
	onAddVertex: (vertex: Vertex) => GraphError | null;
	onAddEdge: (first: Vertex, second: Vertex) => GraphError | null;
	onRemoveVertex: (vertex: Vertex) => void;
	onRemoveEdge: (edge: GraphEdge) => void;
};

const errorMessages: Record<GraphError, string> = {
	"invalid-vertex": "Saisissez un nom de sommet.",
	"duplicate-vertex": "Ce nom est déjà utilisé.",
	"invalid-edge": "Choisissez deux sommets différents.",
	"duplicate-edge": "Cette arête existe déjà.",
};

export function GraphForm({
	graph,
	onAddVertex,
	onAddEdge,
	onRemoveVertex,
	onRemoveEdge,
}: GraphFormProps) {
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
		<div className="grid gap-5 lg:grid-cols-2">
			<section
				aria-labelledby="vertices-title"
				className="rounded-xl border border-border bg-muted/20 p-5 sm:p-6"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="font-mono text-xs text-muted-foreground">
							ENSEMBLE V
						</p>
						<h2 id="vertices-title" className="mt-1 text-lg font-medium">
							Sommets
						</h2>
					</div>
					<span className="rounded-full bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
						{vertices.length}
					</span>
				</div>
				<div className="mt-5 min-h-24 rounded-lg border border-border/70 bg-background p-4">
					<p className="mb-3 font-mono text-xs text-muted-foreground">
						V = &#123; ... &#125;
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
										aria-label={`Supprimer le sommet ${vertex}`}
										onClick={() => onRemoveVertex(vertex)}
									>
										×
									</Button>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-muted-foreground">
							Aucun sommet pour l’instant.
						</p>
					)}
				</div>
				<form className="mt-5" onSubmit={addVertex}>
					<label
						htmlFor="vertex-name"
						className="mb-2 block text-sm font-medium"
					>
						Ajouter un sommet
					</label>
					<div className="flex gap-2">
						<Input
							id="vertex-name"
							value={vertexName}
							onChange={(event) => setVertexName(event.target.value)}
							placeholder="Ex. Départ, A, 5…"
							maxLength={32}
						/>
						<Button type="submit" className="rounded-md">
							Ajouter
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
						<p className="font-mono text-xs text-muted-foreground">
							ENSEMBLE E
						</p>
						<h2 id="edges-title" className="mt-1 text-lg font-medium">
							Arêtes
						</h2>
					</div>
					<span className="rounded-full bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
						{edges.length}
					</span>
				</div>
				<div className="mt-5 min-h-24 rounded-lg border border-border/70 bg-background p-4">
					<p className="mb-3 font-mono text-xs text-muted-foreground">
						E = &#123; ... &#125;
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
										aria-label={`Supprimer l’arête ${edge.first}–${edge.second}`}
										onClick={() => onRemoveEdge(edge)}
									>
										×
									</Button>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-muted-foreground">
							Aucune arête pour l’instant.
						</p>
					)}
				</div>
				<form className="mt-5" onSubmit={addEdge}>
					<p className="mb-2 text-sm font-medium">Relier deux sommets</p>
					<div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
						<select
							aria-label="Premier sommet"
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
							aria-label="Second sommet"
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
							Ajouter
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
	);
}
