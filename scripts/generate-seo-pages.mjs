import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const base = await readFile(join(dist, "index.html"), "utf8");
const origin = "https://graph.fleothing.com";
const pages = {
	home: { path: "/", en: ["Graph Simulator | Create and explore graphs", "Create directed or undirected graphs, add weights, and explore components, cycles, and graph representations."], fr: ["Simulateur de graphes | Créer et explorer", "Créez des graphes orientés ou non orientés, ajoutez des poids et explorez leurs composantes, cycles et représentations."] },
	docs: { path: "/docs", en: ["Graph Simulator | Documentation", "Learn to create directed or undirected graphs and read adjacency matrices, neighbor lists, components, and cycles."], fr: ["Simulateur de graphes | Documentation", "Apprenez à créer des graphes orientés ou non orientés et à lire leurs matrices, listes de voisins, composantes et cycles."] },
	legal: { path: "/legal", en: ["Graph Simulator | Legal information", "Publisher details, privacy, cookies, and terms for Graph Simulator."], fr: ["Simulateur de graphes | Informations légales", "Éditeur, confidentialité, cookies et conditions d’utilisation de Graph Simulator."] },
	simulator: { path: "/simulator", en: ["Graph Simulator | Interactive graph editor", "Build a graph in your browser and inspect its representations, connected components, and cycles."], fr: ["Simulateur de graphes | Éditeur interactif", "Construisez un graphe dans votre navigateur et observez ses représentations, composantes et cycles."], robots: "noindex, follow" },
};
const esc = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
function setMeta(html, attribute, value) {
	const pattern = new RegExp(`(<meta ${attribute} content=")[^"]*("\\s*/?>)`);
	return html.replace(pattern, `$1${esc(value)}$2`);
}
for (const page of Object.values(pages)) {
	for (const language of ["en", "fr"]) {
		const locale = language === "en" ? "en-us" : "fr-fr";
		const path = `/${locale}${page.path === "/" ? "/" : page.path}`;
		const canonical = `${origin}${path}`;
		const [title, description] = page[language];
		let html = base.replace('<html lang="en">', `<html lang="${language === "en" ? "en-US" : "fr-FR"}">`);
		html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
		html = setMeta(html, 'name="description"', description);
		html = setMeta(html, 'name="robots"', page.robots ?? "index, follow");
		html = setMeta(html, 'property="og:locale"', language === "en" ? "en_US" : "fr_FR");
		html = setMeta(html, 'property="og:title"', title);
		html = setMeta(html, 'property="og:description"', description);
		html = setMeta(html, 'property="og:url"', canonical);
		html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`);
		html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, rawSchema) => {
			const schema = JSON.parse(rawSchema);
			for (const entry of schema["@graph"] ?? []) {
				if (entry["@type"] !== "WebSite" && entry["@type"] !== "WebApplication") continue;
				entry.url = canonical;
				entry.inLanguage = language === "en" ? "en-US" : "fr-FR";
				entry.description = description;
			}
			return `<script type="application/ld+json">\n      ${JSON.stringify(schema, null, 6)}\n    </script>`;
		});
		const alternates = `<link rel="alternate" hreflang="en-US" href="${origin}/en-us${page.path === "/" ? "/" : page.path}" /><link rel="alternate" hreflang="fr-FR" href="${origin}/fr-fr${page.path === "/" ? "/" : page.path}" /><link rel="alternate" hreflang="x-default" href="${origin}/en-us${page.path === "/" ? "/" : page.path}" />`;
		html = html.replace("</head>", `${alternates}</head>`);
		const output = join(dist, path, "index.html");
		await mkdir(dirname(output), { recursive: true });
		await writeFile(output, html);
	}
}
