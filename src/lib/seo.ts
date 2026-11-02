import type { Language } from "@/lib/i18n";
import seoContent from "./seo-content.json";

export const siteOrigin = "https://graph.fleothing.com";
export const siteName = seoContent.siteName;

export type PublicPage = "home" | "simulator" | "docs" | "legal";

const pageCopy = seoContent.pages;

type EntityReference = { "@id": string };
type StructuredDataEntity =
	| {
			"@type": "WebSite";
			"@id": string;
			url: string;
			name: string;
			description: string;
			inLanguage: string;
			publisher: EntityReference;
	  }
	| {
			"@type": "WebPage";
			"@id": string;
			url: string;
			name: string;
			description: string;
			inLanguage: string;
			isPartOf: EntityReference;
	  }
	| {
			"@type": "Person";
			"@id": string;
			name: string;
			url: string;
			sameAs: string[];
	  }
	| {
			"@type": "SoftwareApplication";
			"@id": string;
			url: string;
			name: string;
			description: string;
			applicationCategory: string;
			operatingSystem: string;
			inLanguage: string;
			isAccessibleForFree: boolean;
			offers: { "@type": "Offer"; price: string; priceCurrency: string };
			author: EntityReference;
			mainEntityOfPage: EntityReference;
	  }
	| {
			"@type": "TechArticle";
			"@id": string;
			headline: string;
			description: string;
			inLanguage: string;
			mainEntityOfPage: EntityReference;
			author: EntityReference;
	  };

function createStructuredData(
	page: PublicPage,
	language: Language,
	title: string,
	description: string,
	canonical: string,
) {
	const locale = language === "en" ? "en-US" : "fr-FR";
	const authorId = `${siteOrigin}/#author`;
	const graph: StructuredDataEntity[] = [
		{
			"@type": "WebSite",
			"@id": `${siteOrigin}/#website`,
			url: `${siteOrigin}/${language === "en" ? "en-us" : "fr-fr"}/`,
			name: siteName,
			description: pageCopy[language].home.description,
			inLanguage: locale,
			publisher: { "@id": authorId },
		},
		{
			"@type": "WebPage",
			"@id": `${canonical}#webpage`,
			url: canonical,
			name: title,
			description,
			inLanguage: locale,
			isPartOf: { "@id": `${siteOrigin}/#website` },
		},
		{
			"@type": "Person",
			"@id": authorId,
			name: seoContent.author,
			url: "https://leo-torres.fleothing.com/",
			sameAs: [
				"https://github.com/laflut3",
				"https://www.linkedin.com/in/leo-torres-804687264",
			],
		},
	];

	if (page === "home" || page === "simulator") {
		graph.push({
			"@type": "SoftwareApplication",
			"@id": `${siteOrigin}/#application`,
			url: `${siteOrigin}/${language === "en" ? "en-us" : "fr-fr"}/simulator`,
			name: siteName,
			description: pageCopy[language].simulator.description,
			applicationCategory: "EducationalApplication",
			operatingSystem: "Any",
			inLanguage: locale,
			isAccessibleForFree: true,
			offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
			author: { "@id": authorId },
			mainEntityOfPage: { "@id": `${canonical}#webpage` },
		});
	}

	if (page === "docs") {
		graph.push({
			"@type": "TechArticle",
			"@id": `${canonical}#article`,
			headline: title,
			description,
			inLanguage: locale,
			mainEntityOfPage: { "@id": `${canonical}#webpage` },
			author: { "@id": authorId },
		});
	}

	return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function createPageHead({
	title,
	description,
	path,
	language,
	page,
}: {
	title: string;
	description: string;
	path: string;
	language: Language;
	page: PublicPage;
}) {
	const canonical = `${siteOrigin}${path}`;
	const languagePath = path.replace(/^\/(?:en-us|fr-fr)/, "");
	const imageAlt =
		language === "en"
			? "Graph Simulator: an interactive graph theory tool"
			: "Graph Simulator : un outil interactif de théorie des graphes";
	return {
		meta: [
			{ title },
			{ name: "description", content: description },
			{ name: "robots", content: "index, follow" },
			{ name: "author", content: seoContent.author },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: siteName },
			{ property: "og:locale", content: language === "en" ? "en_US" : "fr_FR" },
			{
				property: "og:locale:alternate",
				content: language === "en" ? "fr_FR" : "en_US",
			},
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: canonical },
			{ property: "og:image", content: `${siteOrigin}/social-preview.png` },
			{ property: "og:image:alt", content: imageAlt },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:type", content: "image/png" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: `${siteOrigin}/social-preview.png` },
			{ name: "twitter:image:alt", content: imageAlt },
		],
		links: [
			{ rel: "canonical", href: canonical },
			{
				rel: "alternate",
				hrefLang: "en-US",
				href: `${siteOrigin}/en-us${languagePath}`,
			},
			{
				rel: "alternate",
				hrefLang: "fr-FR",
				href: `${siteOrigin}/fr-fr${languagePath}`,
			},
			{
				rel: "alternate",
				hrefLang: "x-default",
				href:
					page === "home"
						? `${siteOrigin}/`
						: `${siteOrigin}/en-us${languagePath}`,
			},
		],
		scripts: [
			{
				type: "application/ld+json",
				children: createStructuredData(
					page,
					language,
					title,
					description,
					canonical,
				),
			},
		],
	};
}

export function createLocalizedPageHead(
	page: PublicPage,
	language: Language,
	path: string,
) {
	return createPageHead({
		...pageCopy[language][page],
		path,
		language,
		page,
	});
}
