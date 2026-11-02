import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale")({
	beforeLoad: ({ params }) => {
		if (params.locale !== "en-us" && params.locale !== "fr-fr") {
			throw redirect({ href: "/en-us/" });
		}
	},
	component: Outlet,
});
