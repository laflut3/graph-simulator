import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import "@/styles.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
			},
			{ name: "theme-color", content: "#ffffff" },
			{ name: "mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent",
			},
			{ name: "apple-mobile-web-app-title", content: "Graph" },
			{ name: "application-name", content: "Graph Simulator" },
		],
		links: [
			{ rel: "manifest", href: "/manifest.webmanifest" },
			{ rel: "apple-touch-icon", href: "/app-icon-192.png" },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
		],
	}),
	component: RootDocument,
});

function RootDocument() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const language = pathname.startsWith("/fr-fr") ? "fr-FR" : "en-US";
	return (
		<html lang={language}>
			<head>
				<HeadContent />
			</head>
			<body>
				<SiteLayout>
					<Outlet />
				</SiteLayout>
				<Scripts />
			</body>
		</html>
	);
}
