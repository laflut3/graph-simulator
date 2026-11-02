import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

function HomePage() {
	return (
		<main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
			<section className="max-w-4xl">
				<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
					Théorie des graphes
				</p>
				<h1 className="mt-5 text-4xl font-medium tracking-tight sm:text-6xl">
					Simulateur de graphes
				</h1>
				<p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
					Créez des sommets, reliez-les et explorez votre graphe.
				</p>
				<div className="mt-7 flex flex-wrap gap-3">
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

export const Route = createFileRoute("/")({ component: HomePage });
