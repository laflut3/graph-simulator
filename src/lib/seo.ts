export const siteOrigin = "https://graph.fleothing.com";

export function createPageHead({
	title,
	description,
	path,
	robots = "index, follow",
}: {
	title: string;
	description: string;
	path: string;
	robots?: string;
}) {
	const canonical = `${siteOrigin}${path}`;
	return {
		meta: [
			{ title },
			{ name: "description", content: description },
			{ name: "robots", content: robots },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "Graph Simulator" },
			{ property: "og:locale", content: "fr_FR" },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: canonical },
			{ property: "og:image", content: `${siteOrigin}/app-icon-512.png` },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: `${siteOrigin}/app-icon-512.png` },
		],
		links: [{ rel: "canonical", href: canonical }],
	};
}
