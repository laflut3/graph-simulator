import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Graph, GraphEdge, GraphError } from "@/lib/graph/types";

type GraphFormProps = {
	graph: Graph;
	onAddVertex: (vertex: number) => GraphError | null;
	onAddEdge: (first: number, second: number) => GraphError | null;
	onRemoveVertex: (vertex: number) => void;
	onRemoveEdge: (edge: GraphEdge) => void;
};

const errorMessages: Record<GraphError, string> = {
	"invalid-vertex": "Saisissez un entier positif ou nul.",
	"duplicate-vertex": "Ce sommet existe déjà.",
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
	const [vertexName, setVertexName] = useState("5");
	const [edgeFirst, setEdgeFirst] = useState("1");
	const [edgeSecond, setEdgeSecond] = useState("2");
	const [vertexError, setVertexError] = useState("");
	const [edgeError, setEdgeError] = useState("");

	const firstValue = vertices.some((vertex) => String(vertex) === edgeFirst)
		? edgeFirst
		: String(vertices[0] ?? "");
	const otherVertices = vertices.filter(
		(vertex) => String(vertex) !== firstValue,
	);
	const secondValue = otherVertices.some(
		(vertex) => String(vertex) === edgeSecond,
	)
		? edgeSecond
		: String(otherVertices[0] ?? "");

	function addVertex(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const vertex = Number(vertexName);
		if (!/^\d+$/.test(vertexName)) {
			setVertexError(errorMessages["invalid-vertex"]);
			return;
		}
		const error = onAddVertex(vertex);
		setVertexError(error ? errorMessages[error] : "");
		if (!error) setVertexName(String(Math.max(0, ...vertices, vertex) + 1));
	}

	function addEdge(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const error = onAddEdge(Number(firstValue), Number(secondValue));
		setEdgeError(error ? errorMessages[error] : "");
	}

	return (
		<div className="grid gap-12 md:grid-cols-2 md:gap-16">
			<section aria-labelledby="vertices-title">
				<div className="mb-6 flex items-baseline justify-between">
					<h2 id="vertices-title" className="text-sm font-medium">
						Sommets <span className="font-mono text-muted-foreground">V</span>
					</h2>
					<span className="font-mono text-xs text-muted-foreground">
						{vertices.length} éléments
					</span>
				</div>
				<div className="flex min-h-20 flex-wrap items-center gap-x-1 gap-y-2 border-b border-border pb-6 font-mono text-lg sm:text-xl">
					<span className="text-muted-foreground">V = &#123;</span>
					{vertices.length ? (
						vertices.map((vertex, index) => (
							<span
								key={vertex}
								className="inline-flex items-center whitespace-nowrap"
							>
								<span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 py-0.5 pl-2 pr-1">
									{vertex}
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										className="size-5 rounded-sm text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
										aria-label={`Supprimer le sommet ${vertex}`}
										onClick={() => onRemoveVertex(vertex)}
									>
										×
									</Button>
								</span>
								{index < vertices.length - 1 ? "," : ""}
							</span>
						))
					) : (
						<span className="text-muted-foreground">∅</span>
					)}
					<span className="text-muted-foreground">&#125;</span>
				</div>
				<form className="mt-6 space-y-3" onSubmit={addVertex}>
					<label
						htmlFor="vertex-name"
						className="block text-xs text-muted-foreground"
					>
						Ajouter un sommet
					</label>
					<div className="flex gap-2">
						<Input
							id="vertex-name"
							inputMode="numeric"
							value={vertexName}
							onChange={(event) => setVertexName(event.target.value)}
							placeholder="Ex. 5"
						/>
						<Button type="submit" className="rounded-md">
							Ajouter
						</Button>
					</div>
					<p className="min-h-5 text-xs text-destructive" aria-live="polite">
						{vertexError}
					</p>
				</form>
			</section>

			<section aria-labelledby="edges-title">
				<div className="mb-6 flex items-baseline justify-between">
					<h2 id="edges-title" className="text-sm font-medium">
						Arêtes <span className="font-mono text-muted-foreground">E</span>
					</h2>
					<span className="font-mono text-xs text-muted-foreground">
						{edges.length} éléments
					</span>
				</div>
				<div className="flex min-h-20 flex-wrap items-center gap-x-1 gap-y-2 border-b border-border pb-6 font-mono text-lg sm:text-xl">
					<span className="text-muted-foreground">E = &#123;</span>
					{edges.length ? (
						edges.map((edge, index) => (
							<span
								key={`${edge.first}:${edge.second}`}
								className="inline-flex items-center whitespace-nowrap"
							>
								<span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 py-0.5 pl-2 pr-1">
									&#123;{edge.first}, {edge.second}&#125;
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										className="size-5 rounded-sm text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
										aria-label={`Supprimer l’arête ${edge.first}–${edge.second}`}
										onClick={() => onRemoveEdge(edge)}
									>
										×
									</Button>
								</span>
								{index < edges.length - 1 ? "," : ""}
							</span>
						))
					) : (
						<span className="text-muted-foreground">∅</span>
					)}
					<span className="text-muted-foreground">&#125;</span>
				</div>
				<form className="mt-6 space-y-3" onSubmit={addEdge}>
					<p className="text-xs text-muted-foreground">Ajouter une arête</p>
					<datalist id="vertices">
						{vertices.map((vertex) => (
							<option key={vertex} value={vertex} />
						))}
					</datalist>
					<div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
						<Input
							aria-label="Premier sommet"
							type="number"
							min="0"
							list="vertices"
							value={firstValue}
							onChange={(event) => setEdgeFirst(event.target.value)}
							disabled={vertices.length < 2}
						/>
						<span className="font-mono text-muted-foreground">—</span>
						<Input
							aria-label="Second sommet"
							type="number"
							min="0"
							list="vertices"
							value={secondValue}
							onChange={(event) => setEdgeSecond(event.target.value)}
							disabled={vertices.length < 2}
						/>
						<Button
							type="submit"
							className="rounded-md"
							disabled={vertices.length < 2}
						>
							Ajouter
						</Button>
					</div>
					<p className="min-h-5 text-xs text-destructive" aria-live="polite">
						{edgeError}
					</p>
				</form>
			</section>
		</div>
	);
}
