// frontend/src/translations/index.ts
import en from './en.json';
import ru from './ru.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import zh from './zh.json'; // new

export const translations = {
  en,
  ru,
  es,
  fr,
  de,
  zh, // new
} as const;

export type TranslationKey = keyof typeof en;