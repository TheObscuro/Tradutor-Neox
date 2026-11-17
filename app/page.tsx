"use client";
import { useEffect, useRef, useState } from "react";
import {
  EMOTIONS,
  LANGUAGES,
  MAX_PERSONALITY_LENGTH,
  MAX_TEXT_LENGTH,
  SPEED_MAX,
  SPEED_MIN,
  SPEED_STEP,
  type Voice
} from "@/lib/constants";
import { playBlobWithEmotion, stopEmotionPlayback } from "@/lib/audio";
import { addPreset, loadPresets, savePresets, validatePresetName, type Preset } from "@/lib/presets";

async function readError(resp: Response, fallback: string) {
  try {
    const data = await resp.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
}

async function requestSpeech(text: string, voice: string): Promise<Blob> {
  const resp = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice })
  });
  const ct = resp.headers.get("content-type") || "";
  if (!resp.ok || !ct.includes("audio/")) {
    throw new Error(await readError(resp, "Falha ao gerar áudio."));
  }
  return resp.blob();
}

export default function Page() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [personality, setPersonality] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [emotion, setEmotion] = useState("neutral");
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // RF-03: carrega as vozes disponiveis
  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => setVoices(data.voices || []))
      .catch(() => setError("Não foi possível carregar as vozes."));
  }, []);

  // RF-08: favoritos ficam salvos no navegador
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // RNF-05: ESC fecha as janelas e devolve o foco
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setVoiceOpen(false);
      setPresetsOpen(false);
      lastFocus.current?.focus();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // RF-07: a velocidade vale tambem para o audio que ja esta no player
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const tooLong = text.length > MAX_TEXT_LENGTH;

  const openModal = (open: (v: boolean) => void) => {
    lastFocus.current = document.activeElement as HTMLElement;
    open(true);
  };

  const playBlob = async (blob: Blob) => {
    stopEmotionPlayback();
    audioRef.current?.pause();
    if (emotion !== "neutral") {
      await playBlobWithEmotion(blob, emotion, speed); // RF-05
      return;
    }
    const a = audioRef.current!;
    a.src = URL.createObjectURL(blob);
    a.playbackRate = speed;
    await a.play().catch(() => {});
  };

  // RF-01 + RF-02: traduz (se houver idioma) e fala o resultado
  const handleSpeak = async () => {
    setError("");
    if (!text.trim()) { setError("Digite um texto."); return; }
    if (tooLong) { setError(`O texto deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.`); return; }

    setLoading(true);
    setTranslated("");
    try {
      let textToSpeak = text;
      if (targetLanguage) {
        const tr = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLanguage, personality })
        });
        if (!tr.ok) throw new Error(await readError(tr, "Falha ao traduzir."));
        const data = await tr.json();
        textToSpeak = data.translated || text;
        setTranslated(textToSpeak);
      }
      await playBlob(await requestSpeech(textToSpeak, voice));
    } catch (e: any) {
      setError(e?.message || "Erro ao traduzir/gerar áudio.");
    } finally {
      setLoading(false);
    }
  };

  // RF-04: previa da voz
  const playPreview = async (v: Voice) => {
    setError("");
    try {
      const blob = await requestSpeech(`Esta é uma prévia da voz ${v.label}.`, v.id);
      const aud = new Audio(URL.createObjectURL(blob));
      aud.playbackRate = speed;
      await aud.play().catch(() => {});
    } catch (e: any) {
      setError(e?.message || "Não foi possível tocar a prévia.");
    }
  };

  // RF-08: salvar favorito
  const handleSavePreset = () => {
    const name = prompt('Nome do favorito (ex.: "Aula calma - Inglês"):');
    if (name === null) return;
    const invalid = validatePresetName(presets, name);
    if (invalid) { setError(invalid); return; }
    const list = addPreset(presets, {
      id: crypto.randomUUID(),
      name: name.trim(),
      voice,
      emotion,
      personality: personality.trim(),
      targetLanguage,
      speed
    });
    setPresets(list);
    savePresets(list);
    setError("");
  };

  // RF-09: aplicar favorito
  const applyPreset = (p: Preset) => {
    setVoice(p.voice);
    setEmotion(p.emotion);
    setPersonality(p.personality);
    setTargetLanguage(p.targetLanguage);
    setSpeed(Number(p.speed) || 1);
    setPresetsOpen(false);
  };

  // RF-10: excluir favorito
  const deletePreset = (id: string) => {
    const list = presets.filter((x) => x.id !== id);
    setPresets(list);
    savePresets(list);
  };

  const voiceLabel = voices.find((v) => v.id === voice)?.label || voice;
  const emotionLabel = (id: string) => EMOTIONS.find((e) => e.id === id)?.label || id;

  return (
    <main className="wrap">
      <h1>Tradutor Neox 🎙️</h1>

      <div className="field">
        <label htmlFor="text">Texto original</label>
        <textarea
          id="text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o texto..."
        />
        <div className={`hint${tooLong ? " over" : ""}`}>
          {text.length}/{MAX_TEXT_LENGTH} caracteres
        </div>
      </div>

      <div className="field">
        <label htmlFor="lang">Idioma de tradução</label>
        <select id="lang" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
          <option value="">Sem tradução</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="persona">Personalidade (opcional)</label>
        <input
          id="persona"
          type="text"
          maxLength={MAX_PERSONALITY_LENGTH}
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="Ex.: professor paciente, formal, bem-humorado..."
          disabled={!targetLanguage}
        />
        <div className="hint">
          {targetLanguage ? "Ajusta o tom da tradução." : "Disponível quando um idioma de tradução é escolhido."}
        </div>
      </div>

      <div className="field">
        <label>Emoção</label>
        <div className="row">
          {EMOTIONS.map((e) => (
            <button key={e.id} className="grow" aria-pressed={emotion === e.id} onClick={() => setEmotion(e.id)}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Voz <span className="chip">{voiceLabel}</span></label>
        <button onClick={() => openModal(setVoiceOpen)}>Escolher voz</button>
      </div>

      <div className="field">
        <label htmlFor="speed">
          Velocidade <span className="chip">{speed.toFixed(2)}x</span>
        </label>
        <input
          id="speed"
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={SPEED_STEP}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>

      <div className="field row">
        <button onClick={handleSavePreset}>Salvar como favorito</button>
        <button onClick={() => openModal(setPresetsOpen)}>Favoritos ({presets.length})</button>
      </div>

      {error && <div className="error" role="alert">{error}</div>}

      <button className="primary full" onClick={handleSpeak} disabled={loading || tooLong}>
        {loading ? "Gerando..." : targetLanguage ? "Traduzir & Falar" : "Falar"}
      </button>

      <audio ref={audioRef} controls />
      <div className="hint">A voz reproduzida é gerada por inteligência artificial.</div>

      {translated && (
        <section className="result">
          <h3>Tradução</h3>
          <p>{translated}</p>
        </section>
      )}

      {voiceOpen && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setVoiceOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="voiceTitle">
            <header>
              <h2 id="voiceTitle">Escolher voz</h2>
              <button onClick={() => setVoiceOpen(false)}>Fechar</button>
            </header>
            <div className="cards">
              {voices.map((v) => (
                <div key={v.id} className="card">
                  <h3>{v.label}</h3>
                  <p>{v.note}</p>
                  <div className="row">
                    <button onClick={() => playPreview(v)}>Prévia</button>
                    <button className="primary" onClick={() => { setVoice(v.id); setVoiceOpen(false); }}>
                      Usar esta voz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {presetsOpen && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setPresetsOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="presetsTitle">
            <header>
              <h2 id="presetsTitle">Favoritos</h2>
              <button onClick={() => setPresetsOpen(false)}>Fechar</button>
            </header>
            <div className="cards">
              {presets.length === 0 && <div className="card"><p>Nenhum favorito salvo ainda.</p></div>}
              {presets.map((p) => (
                <div key={p.id} className="card">
                  <h3>{p.name}</h3>
                  <p>Voz: {p.voice} · Emoção: {emotionLabel(p.emotion)} · Velocidade: {Number(p.speed).toFixed(2)}x</p>
                  <p>Idioma: {p.targetLanguage || "sem tradução"} · Personalidade: {p.personality || "nenhuma"}</p>
                  <div className="row">
                    <button className="primary" onClick={() => applyPreset(p)}>Aplicar</button>
                    <button onClick={() => deletePreset(p.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
