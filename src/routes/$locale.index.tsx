import { createFileRoute } from "@tanstack/react-router";
import { languageFromLocale } from "@/lib/i18n";
import { createLocalizedPageHead } from "@/lib/seo";
import { HomePage } from "@/routes/index";

export const Route = createFileRoute("/$locale/")({
	head: ({ params }) =>
		createLocalizedPageHead(
			"home",
			languageFromLocale(params.locale),
			`/${params.locale}/`,
		),
	component: HomePage,
});
