import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { localeFromLanguage, text, useLanguage } from "@/lib/i18n";
import { createLocalizedPageHead } from "@/lib/seo";

export function HomePage() {
	const [language] = useLanguage();
	const locale = localeFromLanguage(language);
	return (
		<main className="flex flex-1 items-center justify-center px-4 py-12 text-center sm:px-8 sm:py-16 lg:px-10">
			<section className="w-full max-w-4xl">
				<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
					{text(language, "Graph theory", "Théorie des graphes")}
				</p>
				<h1 className="mt-5 text-4xl font-medium tracking-tight sm:text-6xl">
					{text(language, "Graph simulator", "Simulateur de graphes")}
				</h1>
				<p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
					{text(
						language,
						"Create vertices, connect them, and explore your graph.",
						"Créez des sommets, reliez-les et explorez votre graphe.",
					)}
				</p>
				<div className="mt-7 flex flex-wrap justify-center gap-3">
					<Button asChild size="lg" className="min-h-11">
						<Link to="/$locale/$page" params={{ locale, page: "simulator" }}>
							{text(language, "Open simulator", "Ouvrir le simulateur")}
						</Link>
					</Button>
					<Button asChild variant="outline" size="lg" className="min-h-11">
						<Link to="/$locale/$page" params={{ locale, page: "docs" }}>
							{text(language, "Read the guide", "Lire la documentation")}
						</Link>
					</Button>
				</div>
			</section>
		</main>
	);
}

function RootHomePage() {
	const navigate = useNavigate();
	useEffect(() => {
		try {
			if (window.localStorage.getItem("graph-simulator-language") === "fr") {
				void navigate({ href: `/${localeFromLanguage("fr")}/` });
			}
		} catch {
			// Keep the English default when browser storage is unavailable.
		}
	}, [navigate]);
	return <HomePage />;
}

export const Route = createFileRoute("/")({
	head: () => createLocalizedPageHead("home", "en", "/en-us/"),
	component: RootHomePage,
});
