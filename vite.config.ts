import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: true,
				crawlLinks: false,
				autoStaticPathsDiscovery: false,
				failOnError: true,
			},
			pages: [
				{ path: "/" },
				{ path: "/en-us/" },
				{ path: "/en-us/simulator" },
				{ path: "/en-us/lessons" },
				{ path: "/en-us/docs" },
				{ path: "/en-us/legal" },
				{ path: "/fr-fr/" },
				{ path: "/fr-fr/simulator" },
				{ path: "/fr-fr/lessons" },
				{ path: "/fr-fr/docs" },
				{ path: "/fr-fr/legal" },
			],
		}),
		viteReact(),
	],
});

export default config;
