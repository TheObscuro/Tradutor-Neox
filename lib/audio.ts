// Reproducao do audio com emocao (RF-05) e velocidade (RF-07) usando a Web Audio API.
// A emocao altera apenas a prosodia: velocidade, tom (detune), volume e realce de graves.

type Prosody = { rate: number; detune: number; gainDb: number; filterGain: number };

const PROSODY: Record<string, Prosody> = {
  neutral: { rate: 1.0, detune: 0, gainDb: 0, filterGain: 0 },
  happy: { rate: 1.1, detune: 100, gainDb: 1.5, filterGain: -2 },
  sad: { rate: 0.9, detune: -100, gainDb: -2, filterGain: 2 },
  calm: { rate: 0.95, detune: 0, gainDb: 0, filterGain: 1 },
  energetic: { rate: 1.2, detune: 50, gainDb: 2, filterGain: -1 }
};

let current: { ctx: AudioContext; source: AudioBufferSourceNode } | null = null;

/** Interrompe a reproducao com emocao em andamento, se houver. */
export function stopEmotionPlayback() {
  if (!current) return;
  try { current.source.stop(); } catch {}
  current.ctx.close().catch(() => {});
  current = null;
}

/** Toca o audio aplicando a emocao escolhida e o fator de velocidade do usuario. */
export async function playBlobWithEmotion(blob: Blob, emotion: string, speed = 1) {
  stopEmotionPlayback();
  const p = PROSODY[emotion] ?? PROSODY.neutral;

  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx: AudioContext = new Ctx();
  const audioBuf = await ctx.decodeAudioData(await blob.arrayBuffer());

  const source = ctx.createBufferSource();
  source.buffer = audioBuf;
  source.playbackRate.value = p.rate * speed;
  try { source.detune.setValueAtTime(p.detune, ctx.currentTime); } catch {}

  const filter = ctx.createBiquadFilter();
  filter.type = "peaking";
  filter.frequency.value = 200;
  filter.Q.value = 0.7;
  filter.gain.value = p.filterGain;

  const gain = ctx.createGain();
  gain.gain.value = Math.pow(10, p.gainDb / 20);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.onended = () => { if (current?.source === source) stopEmotionPlayback(); };
  current = { ctx, source };
  source.start(0);
}
