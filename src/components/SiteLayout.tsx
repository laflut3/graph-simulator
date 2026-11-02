import { Link, Outlet } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

export function SiteLayout() {
	const [theme, setTheme] = useState<Theme>("system");
	const [cookieNoticeOpen, setCookieNoticeOpen] = useState(false);

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
		<div className="flex min-h-screen flex-col">
			<header className="border-b border-border">
				<div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-4 sm:px-10">
					<Link
						to="/"
						className="flex items-center gap-3 font-medium tracking-tight"
					>
						<img src="/graph-mark.svg" alt="" className="size-9 rounded-xl" />
						<span>Graph Simulator</span>
					</Link>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
						<nav
							aria-label="Navigation principale"
							className="flex flex-wrap items-center gap-5 text-sm"
						>
							<Link
								to="/"
								activeOptions={{ exact: true }}
								activeProps={{ className: "text-foreground" }}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								Accueil
							</Link>
							<Link
								to="/simulator"
								activeProps={{ className: "text-foreground" }}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								Simulateur
							</Link>
							<Link
								to="/docs"
								activeProps={{ className: "text-foreground" }}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								Documentation
							</Link>
						</nav>
						<label className="flex items-center gap-2 text-xs text-muted-foreground">
							<span className="sr-only">Thème</span>
							<select
								aria-label="Thème"
								value={theme}
								onChange={(event) => setTheme(event.target.value as Theme)}
								className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
							>
								<option value="system">Système</option>
								<option value="light">Clair</option>
								<option value="dark">Sombre</option>
							</select>
						</label>
					</div>
				</div>
			</header>

			<div className="flex-1">
				<Outlet />
			</div>

			<footer className="bg-[#080a10] text-slate-100">
				<div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 sm:py-14">
					<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
						<div>
							<Link
								to="/"
								className="inline-flex items-center gap-3 font-medium"
							>
								<img
									src="/graph-mark.svg"
									alt=""
									className="size-10 rounded-xl"
								/>
								Graph Simulator
							</Link>
							<p className="mt-6 text-sm text-slate-400">
								© {new Date().getFullYear()} Graph Simulator
							</p>
						</div>
						<FooterColumn title="Projet">
							<FooterLink href="https://github.com/laflut3/graph-simulator">
								Dépôt GitHub
							</FooterLink>
							<FooterLink href="https://leo-torres.fleothing.com/">
								Portfolio
							</FooterLink>
						</FooterColumn>
						<FooterColumn title="Réseaux">
							<FooterLink href="https://github.com/laflut3">GitHub</FooterLink>
							<FooterLink href="https://www.linkedin.com/in/leo-torres-804687264">
								LinkedIn
							</FooterLink>
						</FooterColumn>
						<FooterColumn title="Informations légales">
							<FooterLink href="/legal#mentions-legales">
								Mentions légales
							</FooterLink>
							<FooterLink href="/legal#confidentialite">
								Confidentialité
							</FooterLink>
							<FooterLink href="/legal#cookies">Cookies et stockage</FooterLink>
							<FooterLink href="/legal#conditions">
								Conditions d’utilisation
							</FooterLink>
						</FooterColumn>
					</div>
					<div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400">
						<p>Graphe non orienté, construit dans votre navigateur.</p>
						<button
							type="button"
							onClick={() => setCookieNoticeOpen(true)}
							className="transition-colors hover:text-white"
						>
							Informations sur les cookies
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
								Aucun cookie de suivi. Le thème est mémorisé dans ce navigateur.
							</p>
							<a
								href="/legal#cookies"
								className="mt-1 inline-block text-xs underline underline-offset-4"
							>
								En savoir plus
							</a>
						</div>
						<button
							type="button"
							onClick={dismissCookieNotice}
							aria-label="Fermer les informations sur les cookies"
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
							Compris
						</button>
					</div>
				</aside>
			)}
		</div>
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
			<ul className="mt-5 space-y-3 text-sm text-slate-400">{children}</ul>
		</section>
	);
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
	const isExternal = href.startsWith("https://");
	return (
		<li>
			<a
				href={href}
				className="transition-colors hover:text-white"
				{...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
			>
				{children}
			</a>
		</li>
	);
}
