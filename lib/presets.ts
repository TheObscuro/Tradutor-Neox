// Favoritos (presets) de configuracao da fala, salvos apenas no navegador (RNF-08).
import { MAX_PRESETS } from "./constants";

export type Preset = {
  id: string;
  name: string;
  voice: string;
  emotion: string;
  personality: string;
  targetLanguage: string;
  speed: number;
};

const STORAGE_KEY = "neox:presets";

export function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePresets(list: Preset[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

/** RN-08: o favorito mais novo entra no topo e a lista nunca passa de MAX_PRESETS. */
export function addPreset(list: Preset[], preset: Preset): Preset[] {
  return [preset, ...list].slice(0, MAX_PRESETS);
}

/** RN-09: o nome do favorito e obrigatorio e nao pode se repetir. */
export function validatePresetName(list: Preset[], name: string): string | null {
  const n = name.trim();
  if (!n) return "Informe um nome para o favorito.";
  if (list.some((p) => p.name.toLowerCase() === n.toLowerCase())) return "Já existe um favorito com esse nome.";
  return null;
}
