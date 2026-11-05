import { createFileRoute, redirect } from "@tanstack/react-router";
import { LessonsPage } from "@/components/LessonsPage";
import { languageFromLocale } from "@/lib/i18n";
import { createLocalizedPageHead } from "@/lib/seo";
import { DocsPage } from "@/routes/docs";
import { LegalPage } from "@/routes/legal";
import { SimulatorPage } from "@/routes/simulator";

const pageNames = ["simulator", "lessons", "docs", "legal"] as const;

function LocalizedPage() {
	const { page } = Route.useParams();
	if (page === "simulator") return <SimulatorPage />;
	if (page === "lessons") return <LessonsPage />;
	if (page === "docs") return <DocsPage />;
	return <LegalPage />;
}

export const Route = createFileRoute("/$locale/$page")({
	beforeLoad: ({ params }) => {
		if (!pageNames.includes(params.page as (typeof pageNames)[number])) {
			throw redirect({ href: `/${params.locale}/` });
		}
	},
	head: ({ params }) => {
		const page = pageNames.find((name) => name === params.page) ?? "home";
		return createLocalizedPageHead(
			page,
			languageFromLocale(params.locale),
			`/${params.locale}/${page}`,
		);
	},
	component: LocalizedPage,
});
