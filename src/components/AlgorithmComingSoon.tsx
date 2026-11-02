import { text, useLanguage } from "@/lib/i18n";

export function AlgorithmComingSoon() {
	const [language] = useLanguage();
	return (
		<label className="flex items-center gap-2">
			<span className="sr-only">
				{text(language, "Algorithms", "Algorithmes")}
			</span>
			<select
				disabled
				aria-label={text(
					language,
					"Algorithms, coming soon",
					"Algorithmes, bientôt disponibles",
				)}
				className="h-10 min-w-40 cursor-not-allowed rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground opacity-80"
			>
				<option>
					{text(language, "Algorithms · Coming soon", "Algorithmes · Bientôt")}
				</option>
			</select>
		</label>
	);
}
