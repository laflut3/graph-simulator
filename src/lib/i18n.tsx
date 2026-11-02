import { createContext, type ReactNode, useContext } from "react";

export type Language = "en" | "fr";
export type LocalePath = "en-us" | "fr-fr";
type LanguageContextValue = [Language, (language: Language) => void];

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
	language,
	setLanguage,
	children,
}: {
	language: Language;
	setLanguage: (language: Language) => void;
	children: ReactNode;
}) {
	return (
		<LanguageContext.Provider value={[language, setLanguage]}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (!context) throw new Error("LanguageProvider is missing.");
	return context;
}

export function text(language: Language, english: string, french: string) {
	return language === "en" ? english : french;
}

export function languageFromLocale(locale: string): Language {
	return locale === "fr-fr" ? "fr" : "en";
}

export function localeFromLanguage(language: Language): LocalePath {
	return language === "fr" ? "fr-fr" : "en-us";
}
