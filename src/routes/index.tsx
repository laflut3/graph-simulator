import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

function HomePage() {
	return (
		<main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
			<section className="max-w-3xl">
				<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
					Théorie des graphes
				</p>
				<h1 className="mt-5 text-4xl font-medium tracking-tight sm:text-6xl">
					Créez et explorez des graphes.
				</h1>
				<p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
					Ajoutez des sommets, reliez-les et observez les composantes connexes,
					les degrés et les cycles.
				</p>
				<div className="mt-8 flex flex-wrap gap-3">
					<Button asChild size="lg">
						<Link to="/simulator">Ouvrir le simulateur</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link to="/docs">Lire la documentation</Link>
					</Button>
				</div>
			</section>
			<section className="mt-20 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
				<div>
					<p className="font-mono text-sm">01</p>
					<h2 className="mt-3 text-sm font-medium">Construisez</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Nommez les sommets et créez les arêtes.
					</p>
				</div>
				<div>
					<p className="font-mono text-sm">02</p>
					<h2 className="mt-3 text-sm font-medium">Explorez</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Sélectionnez un sommet pour voir ses propriétés.
					</p>
				</div>
				<div>
					<p className="font-mono text-sm">03</p>
					<h2 className="mt-3 text-sm font-medium">Enregistrez</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Importez ou téléchargez le graphe en JSON.
					</p>
				</div>
			</section>
		</main>
	);
}

export const Route = createFileRoute("/")({ component: HomePage });
