import { createFileRoute } from "@tanstack/react-router";

function LegalPage() {
	return (
		<main className="w-full px-4 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
			<header className="border-b border-border pb-6">
				<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
					Graph Simulator
				</p>
				<h1 className="mt-2 text-3xl font-medium tracking-tight">
					Informations légales
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
					Les informations ci-dessous décrivent le fonctionnement actuel du
					simulateur.
				</p>
			</header>
			<div className="divide-y divide-border">
				<section id="mentions-legales" className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">Mentions légales</h2>
					<dl className="mt-4 grid gap-4 text-sm sm:grid-cols-[10rem_1fr]">
						<dt className="text-muted-foreground">Éditeur</dt>
						<dd>Léo Torres</dd>
						<dt className="text-muted-foreground">Adresse postale</dt>
						<dd>Non publiée sur cette page.</dd>
						<dt className="text-muted-foreground">Contact</dt>
						<dd>
							<a
								className="underline underline-offset-4"
								href="mailto:leo0609leo@gmail.com"
							>
								leo0609leo@gmail.com
							</a>
						</dd>
						<dt className="text-muted-foreground">Hébergement</dt>
						<dd>
							Infrastructure Kubernetes privée auto-hébergée par Léo Torres.
						</dd>
						<dt className="text-muted-foreground">Source du projet</dt>
						<dd>
							<a
								className="underline underline-offset-4"
								href="https://github.com/laflut3/graph-simulator"
							>
								github.com/laflut3/graph-simulator
							</a>
						</dd>
					</dl>
				</section>
				<section id="confidentialite" className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">Politique de confidentialité</h2>
					<div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							Le simulateur ne demande pas de compte et ne transmet pas le
							graphe à une API. Les sommets et les arêtes restent dans la
							mémoire de la page. Un fichier JSON est lu par le navigateur lors
							d’un import et téléchargé sur votre appareil lors d’un export.
						</p>
						<p>
							Le choix du thème est enregistré dans le stockage local du
							navigateur. Le bandeau d’information sur les cookies utilise le
							stockage de session pour ne pas réapparaître après fermeture dans
							le même onglet. Le choix du thème y reste jusqu’à son effacement
							dans les réglages du navigateur.
						</p>
						<p>
							Le service worker met en cache l’application et les ressources
							chargées pour permettre une ouverture hors ligne. Il ne stocke pas
							le graphe ni les fichiers JSON importés.
						</p>
						<p>
							Aucun outil de publicité, d’analyse d’audience ou de profilage
							n’est intégré à l’application. L’infrastructure d’hébergement est
							administrée par l’éditeur. Les journaux techniques du serveur
							peuvent contenir des données de connexion nécessaires à son
							fonctionnement et à sa sécurité. Leur durée de conservation
							dépendra de la configuration du serveur.
						</p>
						<p>
							Pour toute question relative à la confidentialité, écrivez à{" "}
							<a
								className="underline underline-offset-4"
								href="mailto:leo0609leo@gmail.com"
							>
								leo0609leo@gmail.com
							</a>
							. Vous pouvez également déposer une réclamation auprès de la{" "}
							<a
								className="underline underline-offset-4"
								href="https://www.cnil.fr/fr/plaintes"
							>
								CNIL
							</a>
							.
						</p>
					</div>
				</section>
				<section id="cookies" className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">Cookies et stockage local</h2>
					<div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							Le simulateur n’utilise actuellement aucun cookie publicitaire ou
							de mesure d’audience. Le thème est gardé dans le stockage local ;
							le bandeau est masqué pour l’onglet courant. Le cache hors ligne
							ne contient que les fichiers de l’application, jamais le graphe.
						</p>
						<p>
							Si des traceurs soumis au consentement sont ajoutés, leur finalité
							sera expliquée et vous pourrez les refuser ou retirer votre choix
							à tout moment.
						</p>
					</div>
				</section>
				<section id="conditions" className="scroll-mt-8 py-7">
					<h2 className="text-lg font-medium">Conditions d’utilisation</h2>
					<div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							Vous pouvez utiliser le simulateur pour créer et étudier des
							graphes non orientés simples. Vérifiez les fichiers JSON importés
							avant de les partager.
						</p>
						<p>
							Le calcul énumère les cycles simples. Leur nombre peut augmenter
							rapidement lorsque le graphe devient dense ; un grand graphe peut
							ralentir le navigateur.
						</p>
						<p>
							Le projet est fourni à des fins pédagogiques. Son code source et
							ses conditions de réutilisation sont disponibles dans le dépôt
							GitHub.
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}

export const Route = createFileRoute("/legal")({ component: LegalPage });
