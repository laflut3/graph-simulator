import { createFileRoute } from "@tanstack/react-router";
import { GraphForm } from "@/components/GraphForm";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return <GraphForm />;
}
