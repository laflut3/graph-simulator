import {
	HeadContent,
	Link,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import {
	type Language,
	LanguageProvider,
	localeFromLanguage,
	text,
} from "@/lib/i18n";

type Theme = "system" | "light" | "dark";
type InstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function SiteLayout() {
	const [theme, setTheme] = useState<Theme>("system");
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const navigate = useNavigate();
	const language: Language = pathname.startsWith("/fr-fr") ? "fr" : "en";
	const locale = localeFromLanguage(language);
	const setLanguage = (nextLanguage: Language) => {
		window.localStorage.setItem("graph-simulator-language", nextLanguage);
		const suffix = pathname.replace(/^\/(?:en-us|fr-fr)/, "");
		if (!suffix || suffix === "/") {
			window.location.assign(`/${localeFromLanguage(nextLanguage)}/`);
			return;
		}
		const page = suffix.split("/").filter(Boolean)[0];
		if (page === "simulator" || page === "docs" || page === "legal") {
			void navigate({
				to: "/$locale/$page",
				params: { locale: localeFromLanguage(nextLanguage), page },
			});
		} else {
			void navigate({
				to: "/$locale",
				params: { locale: localeFromLanguage(nextLanguage) },
			});
		}
	};
	const [cookieNoticeOpen, setCookieNoticeOpen] = useState(false);
	const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
		null,
	);

	useEffect(() => {
		const handleInstallPrompt = (event: Event) => {
			event.preventDefault();
			setInstallPrompt(event as InstallPromptEvent);
		};
		const handleInstalled = () => setInstallPrompt(null);
		window.addEventListener("beforeinstallprompt", handleInstallPrompt);
		window.addEventListener("appinstalled", handleInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
			window.removeEventListener("appinstalled", handleInstalled);
		};
	}, []);

	useEffect(() => {
		try {
			window.localStorage.setItem("graph-simulator-language", language);
		} catch {
			// The URL still determines the language when storage is unavailable.
		}
		document.documentElement.lang = language;
	}, [language]);

	useEffect(() => {
		const savedTheme = window.localStorage.getItem("graph-simulator-theme");
		if (
			savedTheme === "system" ||
			savedTheme === "light" ||
			savedTheme === "dark"
		) {
			setTheme(savedTheme);
		}
		if (!window.sessionStorage.getItem("graph-simulator-cookie-notice")) {
			setCookieNoticeOpen(true);
		}
	}, []);

	useEffect(() => {
		const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
		const applyTheme = () => {
			const isDark =
				theme === "dark" || (theme === "system" && colorScheme.matches);
			document.documentElement.classList.toggle("dark", isDark);
			document.documentElement.style.colorScheme = isDark ? "dark" : "light";
			document
				.querySelector('meta[name="theme-color"]')
				?.setAttribute("content", isDark ? "#080a10" : "#ffffff");
		};
		applyTheme();
		if (theme === "system") colorScheme.addEventListener("change", applyTheme);
		window.localStorage.setItem("graph-simulator-theme", theme);
		return () => colorScheme.removeEventListener("change", applyTheme);
	}, [theme]);

	const dismissCookieNotice = () => {
		window.sessionStorage.setItem("graph-simulator-cookie-notice", "seen");
		setCookieNoticeOpen(false);
	};

	return (
		<LanguageProvider language={language} setLanguage={setLanguage}>
			<HeadContent />
			<div className="flex min-h-screen flex-col">
				<header className="border-b border-border">
					<div className="flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-4 sm:px-8 lg:px-10">
						<a
							href={`/${locale}/`}
							className="flex items-center gap-3 font-medium tracking-tight"
						>
							<img src="/graph-mark.svg" alt="" className="size-9 rounded-xl" />
							<span>Graph Simulator</span>
						</a>
						<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
							<nav
								aria-label={text(
									language,
									"Main navigation",
									"Navigation principale",
								)}
								className="flex flex-wrap items-center gap-5 text-sm"
							>
								<a
									href={`/${locale}/`}
									aria-current={pathname === `/${locale}/` ? "page" : undefined}
									className={`transition-colors hover:text-foreground ${pathname === `/${locale}/` ? "text-foreground" : "text-muted-foreground"}`}
								>
									{text(language, "Home", "Accueil")}
								</a>
								<Link
									to="/$locale/$page"
									params={{ locale, page: "simulator" }}
									activeProps={{ className: "text-foreground" }}
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{text(language, "Simulator", "Simulateur")}
								</Link>
								<Link
									to="/$locale/$page"
									params={{ locale, page: "docs" }}
									activeProps={{ className: "text-foreground" }}
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{text(language, "Documentation", "Documentation")}
								</Link>
							</nav>
							<div className="flex items-center gap-3">
								{installPrompt && (
									<button
										type="button"
										className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
										onClick={async () => {
											await installPrompt.prompt();
											await installPrompt.userChoice;
											setInstallPrompt(null);
										}}
									>
										{text(language, "Install", "Installer")}
									</button>
								)}
								<label className="flex items-center gap-2 text-xs text-muted-foreground">
									<span className="sr-only">
										{text(language, "Theme", "Thème")}
									</span>
									<select
										aria-label={text(language, "Theme", "Thème")}
										value={theme}
										onChange={(event) => setTheme(event.target.value as Theme)}
										className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
									>
										<option value="system">
											{text(language, "System", "Système")}
										</option>
										<option value="light">
											{text(language, "Light", "Clair")}
										</option>
										<option value="dark">
											{text(language, "Dark", "Sombre")}
										</option>
									</select>
								</label>
								<label className="sr-only" htmlFor="site-language">
									{text(language, "Language", "Langue")}
								</label>
								<select
									id="site-language"
									aria-label={text(language, "Language", "Langue")}
									value={language}
									onChange={(event) =>
										setLanguage(event.target.value as Language)
									}
									className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
								>
									<option value="en">English</option>
									<option value="fr">Français</option>
								</select>
							</div>
						</div>
					</div>
				</header>

				<div className="flex flex-1 flex-col">
					<Outlet />
				</div>

				<footer className="border-t border-border bg-muted/40 text-foreground">
					<div className="mx-auto w-full max-w-[1680px] px-4 py-10 sm:px-8 sm:py-12 lg:px-10">
						<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
							<div>
								<a
									href={`/${locale}/`}
									className="inline-flex items-center gap-3 font-medium"
								>
									<img
										src="/graph-mark.svg"
										alt=""
										className="size-10 rounded-xl"
									/>
									Graph Simulator
								</a>
								<p className="mt-6 text-sm text-muted-foreground">
									© {new Date().getFullYear()} Graph Simulator
								</p>
							</div>
							<FooterColumn title={text(language, "Project", "Projet")}>
								<FooterLink href="https://github.com/laflut3/graph-simulator">
									{text(language, "GitHub repository", "Dépôt GitHub")}
								</FooterLink>
								<FooterLink href="https://leo-torres.fleothing.com/">
									Portfolio
								</FooterLink>
							</FooterColumn>
							<FooterColumn title={text(language, "Social", "Réseaux")}>
								<FooterLink href="https://github.com/laflut3">
									GitHub
								</FooterLink>
								<FooterLink href="https://www.linkedin.com/in/leo-torres-804687264">
									LinkedIn
								</FooterLink>
							</FooterColumn>
							<FooterColumn
								title={text(language, "Legal", "Informations légales")}
							>
								<FooterLink href={`/${locale}/legal#legal-notice`}>
									{text(language, "Legal notice", "Mentions légales")}
								</FooterLink>
								<FooterLink href={`/${locale}/legal#privacy`}>
									{text(language, "Privacy", "Confidentialité")}
								</FooterLink>
								<FooterLink href={`/${locale}/legal#cookies`}>
									{text(language, "Cookies and storage", "Cookies et stockage")}
								</FooterLink>
								<FooterLink href={`/${locale}/legal#terms`}>
									{text(language, "Terms of use", "Conditions d’utilisation")}
								</FooterLink>
							</FooterColumn>
						</div>
						<div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
							<p>
								{text(
									language,
									"Undirected graphs, built in your browser.",
									"Graphes non orientés, construits dans votre navigateur.",
								)}
							</p>
							<button
								type="button"
								onClick={() => setCookieNoticeOpen(true)}
								className="transition-colors hover:text-foreground"
							>
								{text(
									language,
									"Cookie information",
									"Informations sur les cookies",
								)}
							</button>
						</div>
					</div>
				</footer>

				{cookieNoticeOpen && (
					<aside
						aria-labelledby="cookie-notice-title"
						className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-xl border border-border bg-background p-4 text-foreground shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-5"
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 id="cookie-notice-title" className="text-sm font-medium">
									Cookies
								</h2>
								<p className="mt-1 text-sm leading-5 text-muted-foreground">
									{text(
										language,
										"Your graph, language, and theme stay in this browser. No tracking cookies.",
										"Votre graphe, votre langue et votre thème restent dans ce navigateur. Aucun cookie de suivi.",
									)}
								</p>
								<a
									href={`/${locale}/legal#cookies`}
									className="mt-1 inline-block text-xs underline underline-offset-4"
								>
									{text(language, "Learn more", "En savoir plus")}
								</a>
							</div>
							<button
								type="button"
								onClick={dismissCookieNotice}
								aria-label={text(
									language,
									"Close cookie information",
									"Fermer les informations sur les cookies",
								)}
								className="rounded px-2 text-lg text-muted-foreground hover:bg-muted"
							>
								×
							</button>
						</div>
						<div className="mt-3 flex justify-end">
							<button
								type="button"
								onClick={dismissCookieNotice}
								className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
							>
								{text(language, "Got it", "Compris")}
							</button>
						</div>
					</aside>
				)}
			</div>
		</LanguageProvider>
	);
}

function FooterColumn({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
				{title}
			</h2>
			<ul className="mt-5 space-y-3 text-sm text-muted-foreground">
				{children}
			</ul>
		</section>
	);
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
	const isExternal = href.startsWith("https://");
	return (
		<li>
			<a
				href={href}
				className="transition-colors hover:text-foreground"
				{...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
			>
				{children}
			</a>
		</li>
	);
}
