import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraphVisualization } from "@/components/GraphVisualization";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Edge = {
	first: number;
	second: number;
};

const initialVertices = [1, 2, 3, 4];
const initialEdges: Edge[] = [
	{ first: 1, second: 2 },
	{ first: 1, second: 3 },
];

function edgeKey(first: number, second: number) {
	return [first, second].sort((a, b) => a - b).join(":");
}

function GraphForm() {
	const [vertices, setVertices] = useState(initialVertices);
	const [edges, setEdges] = useState(initialEdges);
	const [vertexName, setVertexName] = useState("5");
	const [vertexError, setVertexError] = useState("");
	const [edgeFirst, setEdgeFirst] = useState("1");
	const [edgeSecond, setEdgeSecond] = useState("2");
	const [edgeError, setEdgeError] = useState("");

	const firstValue = vertices.some((vertex) => String(vertex) === edgeFirst)
		? edgeFirst
		: String(vertices[0] ?? "");
	const secondOptions = vertices.filter(
		(vertex) => String(vertex) !== firstValue,
	);
	const secondValue = secondOptions.some(
		(vertex) => String(vertex) === edgeSecond,
	)
		? edgeSecond
		: String(secondOptions[0] ?? "");

	function addVertex(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const value = vertexName.trim();

		if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
			setVertexError("Saisissez un entier positif ou nul.");
			return;
		}

		const vertex = Number(value);
		if (vertices.includes(vertex)) {
			setVertexError("Ce sommet existe déjà.");
			return;
		}

		setVertices((current) => [...current, vertex].sort((a, b) => a - b));
		setVertexName(String(Math.max(...vertices, vertex) + 1));
		setVertexError("");
	}

	function removeVertex(vertexToRemove: number) {
		setVertices((current) =>
			current.filter((vertex) => vertex !== vertexToRemove),
		);
		setEdges((current) =>
			current.filter(
				({ first, second }) =>
					first !== vertexToRemove && second !== vertexToRemove,
			),
		);
	}

	function addEdge(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const first = Number(firstValue);
		const second = Number(secondValue);

		if (
			!Number.isInteger(first) ||
			!Number.isInteger(second) ||
			first === second
		) {
			setEdgeError("Choisissez deux sommets différents.");
			return;
		}

		if (
			edges.some(
				(edge) => edgeKey(edge.first, edge.second) === edgeKey(first, second),
			)
		) {
			setEdgeError("Cette arête existe déjà.");
			return;
		}

		setEdges((current) =>
			[
				...current,
				{ first: Math.min(first, second), second: Math.max(first, second) },
			].sort((a, b) => a.first - b.first || a.second - b.second),
		);
		setEdgeError("");
	}

	function removeEdge(edgeToRemove: Edge) {
		const key = edgeKey(edgeToRemove.first, edgeToRemove.second);
		setEdges((current) =>
			current.filter((edge) => edgeKey(edge.first, edge.second) !== key),
		);
	}

	return (
		<main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 text-foreground sm:px-10 sm:py-16">
			<header className="mb-14 border-b border-border pb-8 sm:mb-16">
				<p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
					Théorie des graphes
				</p>
				<div className="flex flex-wrap items-baseline justify-between gap-4">
					<h1 className="font-mono text-3xl font-medium tracking-tight sm:text-4xl">
						G = [V, E]
					</h1>
					<p className="text-sm text-muted-foreground">
						Graphe non orienté simple
					</p>
				</div>
			</header>

			<div className="grid gap-12 md:grid-cols-2 md:gap-16">
				<section aria-labelledby="vertices-title">
					<div className="mb-6 flex items-baseline justify-between gap-4">
						<h2 id="vertices-title" className="text-sm font-medium">
							Sommets <span className="font-mono text-muted-foreground">V</span>
						</h2>
						<span className="font-mono text-xs text-muted-foreground">
							{vertices.length} élément{vertices.length === 1 ? "" : "s"}
						</span>
					</div>

					<div className="flex min-h-20 flex-wrap items-center gap-x-1 gap-y-2 border-b border-border pb-6 font-mono text-lg leading-8 sm:text-xl">
						<span className="text-muted-foreground">V = &#123;</span>
						{vertices.length === 0 ? (
							<span className="text-muted-foreground">∅</span>
						) : (
							vertices.map((vertex, index) => (
								<span
									key={vertex}
									className="inline-flex items-center whitespace-nowrap"
								>
									<span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 py-0.5 pl-2 pr-1">
										<span>{vertex}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											className="size-5 rounded-sm text-xs leading-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:text-destructive"
											aria-label={`Supprimer le sommet ${vertex}`}
											title={`Supprimer le sommet ${vertex}`}
											onClick={() => removeVertex(vertex)}
										>
											×
										</Button>
									</span>
									{index < vertices.length - 1 ? <span>,</span> : null}
								</span>
							))
						)}{" "}
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
								aria-label="Nom du sommet"
								aria-invalid={vertexError ? true : undefined}
								autoComplete="off"
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
					<div className="mb-6 flex items-baseline justify-between gap-4">
						<h2 id="edges-title" className="text-sm font-medium">
							Arêtes <span className="font-mono text-muted-foreground">E</span>
						</h2>
						<span className="font-mono text-xs text-muted-foreground">
							{edges.length} élément{edges.length === 1 ? "" : "s"}
						</span>
					</div>

					<div className="flex min-h-20 flex-wrap items-center gap-x-1 gap-y-2 border-b border-border pb-6 font-mono text-lg leading-8 sm:text-xl">
						<span className="text-muted-foreground">E = &#123;</span>
						{edges.length === 0 ? (
							<span className="text-muted-foreground">∅</span>
						) : (
							edges.map((edge, index) => (
								<span
									key={edgeKey(edge.first, edge.second)}
									className="inline-flex items-center whitespace-nowrap"
								>
									<span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 py-0.5 pl-2 pr-1">
										<span>
											&#123;{edge.first}, {edge.second}&#125;
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											className="size-5 rounded-sm text-xs leading-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:text-destructive"
											aria-label={`Supprimer l’arête ${edge.first}–${edge.second}`}
											title={`Supprimer l’arête ${edge.first}–${edge.second}`}
											onClick={() => removeEdge(edge)}
										>
											×
										</Button>
									</span>
									{index < edges.length - 1 ? <span>,</span> : null}
								</span>
							))
						)}{" "}
						<span className="text-muted-foreground">&#125;</span>
					</div>

					<form className="mt-6 space-y-3" onSubmit={addEdge}>
						<label className="block text-xs text-muted-foreground">
							Ajouter une arête
						</label>
						<div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
							<Select
								value={firstValue}
								onValueChange={(value) => setEdgeFirst(value)}
								disabled={vertices.length < 2}
							>
								<SelectTrigger aria-label="Premier sommet" className="w-full">
									<SelectValue placeholder="Sommet" />
								</SelectTrigger>
								<SelectContent>
									{vertices.map((vertex) => (
										<SelectItem key={vertex} value={String(vertex)}>
											{vertex}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<span className="font-mono text-muted-foreground">—</span>
							<Select
								value={secondValue}
								onValueChange={(value) => setEdgeSecond(value)}
								disabled={vertices.length < 2}
							>
								<SelectTrigger aria-label="Second sommet" className="w-full">
									<SelectValue placeholder="Sommet" />
								</SelectTrigger>
								<SelectContent>
									{secondOptions.map((vertex) => (
										<SelectItem key={vertex} value={String(vertex)}>
											{vertex}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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

			<GraphVisualization vertices={vertices} edges={edges} />
		</main>
	);
}

export { GraphForm };
