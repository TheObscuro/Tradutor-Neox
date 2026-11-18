
export interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: string;
}

const STORAGE_KEY = "neox:translation-history";
const MAX_HISTORY_ITEMS = 50;

export function loadTranslationHistory(): TranslationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTranslationHistory(
  records: TranslationRecord[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records.slice(0, MAX_HISTORY_ITEMS))
    );
  } catch {
    // O armazenamento pode estar indisponível.
  }
}

export function clearTranslationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // O armazenamento pode estar indisponível.
  }
}
  

export function addTranslationHistory(
  record: TranslationRecord
): TranslationRecord[] {
  const history = loadTranslationHistory();

  const updated = [
    record,
    ...history.filter((item) => item.id !== record.id),
  ].slice(0, MAX_HISTORY_ITEMS);

  saveTranslationHistory(updated);

  return updated;
}


export function deleteTranslationHistory(
  id: string
): TranslationRecord[] {
  const history = loadTranslationHistory();

  const updated = history.filter(
    (record) => record.id !== id
  );

  saveTranslationHistory(updated);

  return updated;
}

