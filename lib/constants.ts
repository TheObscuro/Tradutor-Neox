// Constantes compartilhadas entre o front-end e as rotas da API.
// Cada valor corresponde a uma regra de negocio documentada em docs/02-requisitos.md.

export type Voice = { id: string; label: string; note: string };

/** RN-04: apenas estas vozes podem ser usadas na sintese. */
export const VOICES: Voice[] = [
  { id: "alloy", label: "Alloy", note: "Clara e natural" },
  { id: "echo", label: "Echo", note: "Quente, conversacional" },
  { id: "fable", label: "Fable", note: "Narrativa, leve" },
  { id: "onyx", label: "Onyx", note: "Grave, marcante" },
  { id: "nova", label: "Nova", note: "Brilhante, expressiva" },
  { id: "shimmer", label: "Shimmer", note: "Suave, moderna" }
];

/** RN-03: idiomas de destino suportados. */
export const LANGUAGES: string[] = [
  "Português do Brasil",
  "Inglês Americano",
  "Espanhol",
  "Francês",
  "Alemão",
  "Italiano",
  "Japonês",
  "Chinês (Mandarim)",
  "Coreano",
  "Russo",
  "Árabe",
  "Hindi",
  "Sueco",
  "Norueguês",
  "Holandês",
  "Turco",
  "Grego",
  "Hebraico",
  "Tailandês",
  "Polonês",
  "Romeno",
  "Ucraniano",
  "Finlandês",
  "Indonésio",
  "Vietnamita"
];

export type Emotion = { id: string; label: string };

/** RN-05: emocoes disponiveis para a fala. */
export const EMOTIONS: Emotion[] = [
  { id: "neutral", label: "Neutro" },
  { id: "happy", label: "Feliz" },
  { id: "sad", label: "Triste" },
  { id: "calm", label: "Sereno" },
  { id: "energetic", label: "Energético" }
];

/** RN-01: tamanho maximo do texto original digitado pelo usuario. */
export const MAX_TEXT_LENGTH = 1000;

/** RN-01: tamanho maximo do texto enviado para sintese (limite do servico de voz). */
export const MAX_TTS_LENGTH = 4096;

/** RN-06: tamanho maximo da descricao de personalidade. */
export const MAX_PERSONALITY_LENGTH = 100;

/** RN-07: faixa permitida de velocidade de reproducao. */
export const SPEED_MIN = 0.6;
export const SPEED_MAX = 1.6;
export const SPEED_STEP = 0.05;

/** RN-08: quantidade maxima de favoritos salvos no navegador. */
export const MAX_PRESETS = 40;
