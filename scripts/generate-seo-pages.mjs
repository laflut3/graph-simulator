import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDirectory = join(projectRoot, "dist");
const baseHtml = await readFile(join(distDirectory, "index.html"), "utf8");
const origin = "https://graph.fleothing.com";

const pages = [
	{
		path: "/docs",
		title: "Documentation du simulateur de graphes | Graph Simulator",
		description:
			"Apprenez à créer un graphe non orienté, lire sa matrice d’adjacence et ses listes de voisins, et comprendre ses composantes et cycles.",
	},
	{
		path: "/legal",
		title: "Informations légales | Graph Simulator",
		description:
			"Mentions légales, politique de confidentialité et informations sur les cookies de Graph Simulator.",
	},
	{
		path: "/simulator",
		title: "Simulateur de graphes interactif | Graph Simulator",
		description:
			"Construisez un graphe dans votre navigateur et visualisez ses représentations, composantes connexes et cycles.",
		robots: "noindex, follow",
	},
];

function escapeHtml(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function replaceMeta(html, selector, content) {
	const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const expression = new RegExp(`(<meta ${escapedSelector} content=")[^"]*("\\s*/?>)`);
	return html.replace(expression, `$1${escapeHtml(content)}$2`);
}

for (const page of pages) {
	const canonical = `${origin}${page.path}`;
	let html = baseHtml.replace(
		/<title>[^<]*<\/title>/,
		`<title>${escapeHtml(page.title)}</title>`,
	);
	html = replaceMeta(
		html,
		'name="description"',
		page.description,
	);
	html = html.replace(
		/<link rel="canonical" href="[^"]*"\s*\/>/,
		`<link rel="canonical" href="${canonical}" />`,
	);
	html = replaceMeta(html, 'name="robots"', page.robots ?? "index, follow");
	html = replaceMeta(html, 'property="og:title"', page.title);
	html = replaceMeta(html, 'property="og:description"', page.description);
	html = replaceMeta(html, 'property="og:url"', canonical);
	const filePath = join(distDirectory, page.path.slice(1), "index.html");
	await mkdir(dirname(filePath), { recursive: true });
	await writeFile(filePath, html);
}
