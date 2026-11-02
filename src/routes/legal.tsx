import { createFileRoute, redirect } from "@tanstack/react-router";
import { type Language, localeFromLanguage, useLanguage } from "@/lib/i18n";
import { createPageHead } from "@/lib/seo";

export function LegalPage() {
	const [language] = useLanguage();
	const copy =
		language === "en"
			? {
					title: "Legal information",
					intro: "How Graph Simulator handles data and runs.",
					notice: "Legal notice",
					publisher: "Publisher",
					email: "Contact",
					hosting: "Hosting",
					privacy: "Privacy",
					privacyBody:
						"No account is required. Your graph is saved in this browser’s local storage and is not sent to an application API. Imported JSON is read locally; exports are downloaded to your device. Theme and language preferences are also stored here. The service worker caches app files for offline use, not graph data.",
					cookies: "Cookies and storage",
					cookiesBody:
						"The app uses no advertising or analytics cookies. It saves your graph, theme, and language in local storage and remembers dismissal of this notice for the current tab. You can clear these values in your browser settings.",
					terms: "Terms of use",
					termsBody:
						"This educational tool is provided as is. It supports simple undirected graphs. Cycle enumeration can become slow for dense or large graphs. Check JSON files before sharing them.",
					address: "Postal address",
					addressValue: "Not published.",
					hosted: "Vercel",
					legalId: "legal-notice",
				}
			: {
					title: "Informations légales",
					intro: "Fonctionnement et données de Graph Simulator.",
					notice: "Mentions légales",
					publisher: "Éditeur",
					email: "Contact",
					hosting: "Hébergement",
					privacy: "Confidentialité",
					privacyBody:
						"Aucun compte n’est nécessaire. Votre graphe est enregistré dans le stockage local du navigateur et n’est pas envoyé à une API applicative. Les fichiers JSON sont lus localement ou téléchargés sur votre appareil. Le thème et la langue y sont aussi mémorisés. Le service worker met en cache les fichiers de l’application, pas les graphes.",
					cookies: "Cookies et stockage",
					cookiesBody:
						"L’application n’utilise pas de cookie publicitaire ou de mesure d’audience. Elle enregistre le graphe, le thème et la langue dans le stockage local, et la fermeture de ce bandeau pour l’onglet courant. Vous pouvez effacer ces données dans les réglages du navigateur.",
					terms: "Conditions d’utilisation",
					termsBody:
						"Cet outil pédagogique est fourni en l’état. Il prend en charge les graphes simples non orientés. Le calcul des cycles peut ralentir sur les graphes denses ou volumineux. Vérifiez les fichiers JSON avant de les partager.",
					address: "Adresse postale",
					addressValue: "Non publiée.",
					hosted: "Vercel",
					legalId: "legal-notice",
				};
	return (
		<main className="w-full px-4 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
			<header className="border-b border-border pb-6">
				<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
					Graph Simulator
				</p>
				<h1 className="mt-2 text-3xl font-medium tracking-tight">
					{copy.title}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
					{copy.intro}
				</p>
			</header>
			<div className="divide-y divide-border">
				<section id={copy.legalId} className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">{copy.notice}</h2>
					<dl className="mt-4 grid gap-4 text-sm sm:grid-cols-[10rem_1fr]">
						<dt className="text-muted-foreground">{copy.publisher}</dt>
						<dd>Léo Torres</dd>
						<dt className="text-muted-foreground">{copy.address}</dt>
						<dd>{copy.addressValue}</dd>
						<dt className="text-muted-foreground">{copy.email}</dt>
						<dd>
							<a
								className="underline underline-offset-4"
								href="mailto:leo0609leo@gmail.com"
							>
								leo0609leo@gmail.com
							</a>
						</dd>
						<dt className="text-muted-foreground">{copy.hosting}</dt>
						<dd>{copy.hosted}</dd>
					</dl>
				</section>
				<section id="privacy" className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">{copy.privacy}</h2>
					<p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
						{copy.privacyBody}
					</p>
				</section>
				<section id="cookies" className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">{copy.cookies}</h2>
					<p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
						{copy.cookiesBody}
					</p>
				</section>
				<section id="terms" className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">{copy.terms}</h2>
					<p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
						{copy.termsBody}
					</p>
				</section>
			</div>
		</main>
	);
}

export const Route = createFileRoute("/legal")({
	beforeLoad: () => {
		const language: Language =
			window.localStorage.getItem("graph-simulator-language") === "fr"
				? "fr"
				: "en";
		throw redirect({
			to: "/$locale/$page",
			params: { locale: localeFromLanguage(language), page: "legal" },
		});
	},
	head: () =>
		createPageHead({
			title: "Legal information | Graph Simulator",
			description: "Legal and privacy information for Graph Simulator.",
			path: "/legal",
		}),
	component: LegalPage,
});
