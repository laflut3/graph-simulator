import type { GraphAnalysis } from "@/lib/graph/analyze";
import type { Vertex } from "@/lib/graph/types";
import { text, useLanguage } from "@/lib/i18n";

type Props = {
	directed: boolean;
	analysis: GraphAnalysis;
	selectedVertex: Vertex | null;
	onSelectVertex: (vertex: Vertex | null) => void;
};

export function GraphInsights({
	directed,
	analysis,
	selectedVertex,
	onSelectVertex,
}: Props) {
	const [language] = useLanguage();
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
				</section>
			)}
		</div>
	);
}
