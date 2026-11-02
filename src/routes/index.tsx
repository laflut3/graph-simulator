import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { createPageHead } from "@/lib/seo";

function HomePage() {
	return (
		<main className="flex flex-1 items-center justify-center px-4 py-12 text-center sm:px-8 sm:py-16 lg:px-10">
			<section className="w-full max-w-4xl">
				<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
					Théorie des graphes
				</p>
				<h1 className="mt-5 text-4xl font-medium tracking-tight sm:text-6xl">
					Simulateur de graphes
				</h1>
				<p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
					Créez des sommets, reliez-les et explorez votre graphe.
				</p>
				<div className="mt-7 flex flex-wrap justify-center gap-3">
					<Button asChild size="lg">
						<Link to="/simulator">Ouvrir le simulateur</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link to="/docs">Lire la documentation</Link>
					</Button>
				</div>
			</section>
		</main>
	);
}

export const Route = createFileRoute("/")({
	head: () =>
		createPageHead({
			title: "Simulateur de graphes en ligne | Graph Simulator",
			description:
				"Créez un graphe non orienté, ajoutez des sommets et des arêtes, puis explorez ses composantes, ses cycles et ses représentations.",
			path: "/",
		}),
	component: HomePage,
});
