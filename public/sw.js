const CACHE_NAME = "graph-simulator-v3";
const APP_SHELL = [
	"/",
	"/en-us/lessons",
	"/fr-fr/lessons",
	"/favicon.svg",
	"/graph-mark.svg",
	"/manifest.webmanifest",
	"/app-icon-192.png",
	"/app-icon-512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			const shell = await fetch("/");
			if (!shell.ok) throw new Error("Unable to cache the app shell");
			const html = await shell.clone().text();
			await cache.put("/", shell);
			const assets = Array.from(
				html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css))"/g),
				(match) => match[1],
			);
			const stylesheets = assets.filter((asset) => asset.endsWith(".css"));
			const fonts = [];
			for (const stylesheet of stylesheets) {
				const cssResponse = await fetch(stylesheet);
				const css = await cssResponse.text();
				fonts.push(
					...Array.from(
						css.matchAll(/url\(["']?(\/[^)"']+\.(?:woff2?|ttf|otf))["']?\)/g),
						(match) => match[1],
					),
				);
			}
			await cache.addAll([...APP_SHELL.slice(1), ...assets, ...fonts]);
			await self.skipWaiting();
		})(),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter(
							(key) => key.startsWith("graph-simulator-") && key !== CACHE_NAME,
						)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin)
		return;

	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (!response.ok) return response;
					return caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(request, response.clone()))
						.then(() => response);
				})
				.catch(async () =>
					(await caches.match(request)) ??
					(await caches.match("/")) ??
					new Response("Offline", {
						status: 503,
						headers: { "Content-Type": "text/plain; charset=utf-8" },
					}),
			),
		);
		return;
	}

	event.respondWith(
		caches.match(request).then(
			(cached) =>
				cached ??
				fetch(request).then((response) => {
					if (!response.ok) return response;
					return caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(request, response.clone()))
						.then(() => response);
				}),
		),
	);
});
