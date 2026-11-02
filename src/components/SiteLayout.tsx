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

function loadTheme(): Theme {
	try {
		const theme = window.localStorage.getItem("graph-simulator-theme");
		if (theme === "light" || theme === "dark" || theme === "system")
			return theme;
	} catch {
		// Keep the app usable when browser storage is unavailable.
	}
	return "system";
}

export function SiteLayout() {
	const [theme, setTheme] = useState<Theme>(loadTheme);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const navigate = useNavigate();
	const language: Language = pathname.startsWith("/fr-fr") ? "fr" : "en";
	const locale = localeFromLanguage(language);
	const setLanguage = (nextLanguage: Language) => {
		try {
			window.localStorage.setItem("graph-simulator-language", nextLanguage);
		} catch {
			// The destination URL still keeps the selected language.
		}
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
		document.documentElement.lang = language === "en" ? "en-US" : "fr-FR";
	}, [language]);

	useEffect(() => {
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
		try {
			window.localStorage.setItem("graph-simulator-theme", theme);
		} catch {
			// The selected theme still applies for this session.
		}
		return () => colorScheme.removeEventListener("change", applyTheme);
	}, [theme]);

	const dismissCookieNotice = () => {
		window.sessionStorage.setItem("graph-simulator-cookie-notice", "seen");
		setCookieNoticeOpen(false);
	};

	return (
		<LanguageProvider language={language} setLanguage={setLanguage}>
			<HeadContent />
			<div className="flex min-h-dvh flex-col">
				<header className="pwa-header border-b border-border">
					<div className="safe-header flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 sm:gap-x-8 sm:gap-y-3 sm:py-4">
						<a
							href={`/${locale}/`}
							className="flex items-center gap-3 font-medium tracking-tight"
						>
							<img src="/graph-mark.svg" alt="" className="size-9 rounded-xl" />
							<span>Graph Simulator</span>
						</a>
						<div className="contents">
							<nav
								aria-label={text(
									language,
									"Main navigation",
									"Navigation principale",
								)}
								className="order-3 flex w-full flex-wrap items-center gap-3 text-sm sm:gap-5 md:order-none md:w-auto"
							>
								<a
									href={`/${locale}/`}
									aria-current={pathname === `/${locale}/` ? "page" : undefined}
									className={`inline-flex min-h-10 items-center transition-colors hover:text-foreground ${pathname === `/${locale}/` ? "text-foreground" : "text-muted-foreground"}`}
								>
									{text(language, "Home", "Accueil")}
								</a>
								<Link
									to="/$locale/$page"
									params={{ locale, page: "simulator" }}
									activeProps={{ className: "text-foreground" }}
									className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground"
								>
									{text(language, "Simulator", "Simulateur")}
								</Link>
								<Link
									to="/$locale/$page"
									params={{ locale, page: "docs" }}
									activeProps={{ className: "text-foreground" }}
									className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground"
								>
									{text(language, "Documentation", "Documentation")}
								</Link>
							</nav>
							<div className="order-2 ml-auto flex items-center gap-2 md:order-none md:ml-0 md:gap-3">
								{installPrompt && (
									<>
										<button
											type="button"
											aria-label={text(
												language,
												"Install app",
												"Installer l’application",
											)}
											title={text(
												language,
												"Install app",
												"Installer l’application",
											)}
											className="grid size-10 place-items-center rounded-md border border-border hover:bg-muted sm:hidden"
											onClick={async () => {
												await installPrompt.prompt();
												await installPrompt.userChoice;
												setInstallPrompt(null);
											}}
										>
											<InstallIcon />
										</button>
										<button
											type="button"
											className="hidden min-h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-foreground hover:bg-muted sm:inline-flex"
											onClick={async () => {
												await installPrompt.prompt();
												await installPrompt.userChoice;
												setInstallPrompt(null);
											}}
										>
											<InstallIcon />
											{text(language, "Install", "Installer")}
										</button>
									</>
								)}
								<label className="relative grid h-10 w-10 place-items-center rounded-md border border-border text-foreground focus-within:ring-2 focus-within:ring-ring/50 sm:hidden">
									<ThemeIcon theme={theme} />
									<span className="sr-only">
										{text(language, "Theme", "Thème")}
									</span>
									<select
										aria-label={text(language, "Theme", "Thème")}
										value={theme}
										onChange={(event) => setTheme(event.target.value as Theme)}
										className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
								<label className="relative grid h-10 min-w-14 place-items-center rounded-md border border-border text-xs font-medium text-foreground focus-within:ring-2 focus-within:ring-ring/50 sm:hidden">
									<span
										className="inline-flex items-center gap-1.5"
										aria-hidden="true"
									>
										<LanguageIcon />
										{language.toUpperCase()}
									</span>
									<span className="sr-only">
										{text(language, "Language", "Langue")}
									</span>
									<select
										aria-label={text(language, "Language", "Langue")}
										value={language}
										onChange={(event) =>
											setLanguage(event.target.value as Language)
										}
										className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
									>
										<option value="en">English</option>
										<option value="fr">Français</option>
									</select>
								</label>
								<label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
									<span className="sr-only">
										{text(language, "Theme", "Thème")}
									</span>
									<select
										aria-label={text(language, "Theme", "Thème")}
										value={theme}
										onChange={(event) => setTheme(event.target.value as Theme)}
										className="h-10 rounded-md border border-border bg-background px-2 text-xs text-foreground"
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
									className="hidden h-10 rounded-md border border-border bg-background px-2 text-xs text-foreground sm:block"
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
					<div className="safe-footer mx-auto w-full max-w-[1680px] px-4 py-10 sm:px-8 sm:py-12 lg:px-10">
						<div className="grid gap-5 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
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
							</FooterColumn>
							<FooterColumn title={text(language, "Social", "Réseaux")}>
								<FooterLink href="https://github.com/laflut3">
									GitHub
								</FooterLink>
								<FooterLink href="https://www.linkedin.com/in/leo-torres-804687264">
									LinkedIn
								</FooterLink>
								<FooterLink href="https://leo-torres.fleothing.com/">
									Portfolio
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
						<div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs text-muted-foreground sm:mt-12 sm:pt-6">
							<p>
								{text(
									language,
									"Graphs, built in your browser.",
									"Graphes construits dans votre navigateur.",
								)}
							</p>
							<button
								type="button"
								onClick={() => setCookieNoticeOpen(true)}
								className="inline-flex min-h-10 items-center gap-2 transition-colors hover:text-foreground"
							>
								<CookieIcon />
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
						className="safe-cookie fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-xl border border-border bg-background p-4 text-foreground shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-5"
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
								className="-mr-2 -mt-2 grid size-10 shrink-0 place-items-center rounded text-lg text-muted-foreground hover:bg-muted"
							>
								×
							</button>
						</div>
						<div className="mt-3 flex justify-end">
							<button
								type="button"
								onClick={dismissCookieNotice}
								className="min-h-11 rounded-md bg-primary px-4 text-sm text-primary-foreground"
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
	const [compact, setCompact] = useState(
		() => window.matchMedia("(max-width: 639px)").matches,
	);
	const [open, setOpen] = useState(!compact);
	useEffect(() => {
		const media = window.matchMedia("(max-width: 639px)");
		const update = () => {
			setCompact(media.matches);
			setOpen(!media.matches);
		};
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	return (
		<details
			open={!compact || open}
			onToggle={(event) => setOpen(event.currentTarget.open)}
			className="group/footer border-b border-border last:border-0 sm:border-0"
		>
			<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] marker:hidden sm:hidden [&::-webkit-details-marker]:hidden">
				{title}
				<span className="text-base text-muted-foreground">
					{open ? "−" : "+"}
				</span>
			</summary>
			<h2 className="hidden text-xs font-semibold uppercase tracking-[0.16em] sm:block">
				{title}
			</h2>
			<ul className="mt-1 space-y-0.5 text-sm text-muted-foreground sm:mt-5 sm:space-y-3">
				{children}
			</ul>
		</details>
	);
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
	const isExternal = href.startsWith("https://");
	return (
		<li>
			<a
				href={href}
				className="inline-flex min-h-10 items-center gap-2 transition-colors hover:text-foreground"
				{...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
			>
				<FooterLinkIcon href={href} />
				{children}
			</a>
		</li>
	);
}

function FooterLinkIcon({ href }: { href: string }) {
	if (href.includes("github.com")) {
		return (
			<svg
				aria-hidden="true"
				viewBox="0 0 16 16"
				fill="currentColor"
				className="size-4 shrink-0 opacity-70"
			>
				<path d="M8 .9a7.1 7.1 0 0 0-2.25 13.84c.36.07.49-.16.49-.35v-1.25c-2 .44-2.42-.85-2.42-.85-.33-.83-.8-1.05-.8-1.05-.65-.45.05-.44.05-.44.72.05 1.1.74 1.1.74.64 1.1 1.68.78 2.09.6.06-.47.25-.78.46-.96-1.6-.18-3.28-.8-3.28-3.56 0-.79.28-1.44.74-1.94-.07-.18-.32-.92.07-1.91 0 0 .6-.19 1.96.74A6.8 6.8 0 0 1 8 4.27c.6 0 1.2.08 1.76.24 1.36-.93 1.96-.74 1.96-.74.39.99.14 1.73.07 1.91.46.5.74 1.15.74 1.94 0 2.77-1.68 3.38-3.29 3.56.26.22.49.66.49 1.33v1.88c0 .19.13.42.5.35A7.1 7.1 0 0 0 8 .9Z" />
			</svg>
		);
	}
	if (href.includes("linkedin.com")) {
		return (
			<svg
				aria-hidden="true"
				viewBox="0 0 16 16"
				fill="currentColor"
				className="size-4 shrink-0 opacity-70"
			>
				<path d="M3.05 5.8H.7v9.1h2.35V5.8ZM1.88 4.55a1.36 1.36 0 1 0 0-2.72 1.36 1.36 0 0 0 0 2.72ZM15.3 9.68c0-2.44-1.3-3.58-3.04-3.58a2.63 2.63 0 0 0-2.37 1.3V5.8H7.54v9.1h2.35v-4.5c0-1.18.22-2.33 1.7-2.33 1.47 0 1.49 1.36 1.49 2.4v4.43h2.34V9.68Z" />
			</svg>
		);
	}
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.3"
			className="size-4 shrink-0 opacity-70"
		>
			{href.startsWith("https://") ? (
				<path d="M9 2.5h4.5V7M13.2 2.8 7.5 8.5M12 9v3.5H3.5v-9H7" />
			) : (
				<path d="M4 2.5h5l3 3v8H4zM9 2.5v3h3M6 8h4M6 10.5h4" />
			)}
		</svg>
	);
}

function CookieIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.3"
			className="size-4"
		>
			<path d="M8 2a2 2 0 0 0 3 2.2A2 2 0 0 0 13.2 7 2 2 0 0 0 14 8a6 6 0 1 1-6-6Z" />
			<path d="M5.5 8.5h.01M7 11h.01M4.5 5.5h.01" />
		</svg>
	);
}

function InstallIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.3"
			className="size-4"
		>
			<path d="M8 2.5v7m0 0 2.5-2.5M8 9.5 5.5 7M3.5 10.5v3h9v-3" />
		</svg>
	);
}

function ThemeIcon({ theme }: { theme: Theme }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.4"
			className="size-4"
		>
			{theme === "dark" ? (
				<path d="M16 12.4A6.7 6.7 0 0 1 7.6 4a6.8 6.8 0 1 0 8.4 8.4Z" />
			) : theme === "light" ? (
				<>
					<circle cx="10" cy="10" r="3.2" />
					<path d="M10 2v1.5m0 13V18m8-8h-1.5m-13 0H2m13.66-5.66-1.06 1.06m-9.2 9.2-1.06 1.06m11.32 0-1.06-1.06m-9.2-9.2L4.34 4.34" />
				</>
			) : (
				<path d="M4 3.5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 16 14.5H4A1.5 1.5 0 0 1 2.5 13V5A1.5 1.5 0 0 1 4 3.5Zm4 14h4m-2-3v3" />
			)}
		</svg>
	);
}

function LanguageIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeWidth="1.4"
			className="size-4"
		>
			<circle cx="10" cy="10" r="7.5" />
			<path d="M2.8 7h14.4M2.8 13h14.4M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5c-2-2-3-4.5-3-7.5s1-5.5 3-7.5Z" />
		</svg>
	);
}
