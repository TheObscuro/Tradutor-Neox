"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Voice = { id: string; label: string; note?: string };

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

type Preset = {
  id: string;
  name: string;
  voice: string;
  emotion: string;
  personality: string;
  targetLanguage: string;
  speed: string;
};

export default function Page() {
  // Estado base
  const [text, setText] = useState("");
  const [personality, setPersonality] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [currentVoice, setCurrentVoice] = useLocalStorage<string>("tts:voice", "alloy");
  const [emotion, setEmotion] = useLocalStorage<string>("tts:emotion", "neutral");
  const [speed, setSpeed] = useState("1.00");

  // Vozes
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Presets
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [presets, setPresets] = useLocalStorage<Preset[]>("tts:presets", []);

  // Player
  const audioRef = useRef<HTMLAudioElement>(null);

  // A11y focus
  const lastFocus = useRef<HTMLElement | null>(null);

  // Carregar vozes
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/voices");
      const data = await r.json();
      setVoices(data.voices || []);
    })();
  }, []);

  // Acessibilidade: ESC fecha
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (voiceOpen) setVoiceOpen(false);
        if (presetsOpen) setPresetsOpen(false);
        lastFocus.current?.focus();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [voiceOpen, presetsOpen]);

  const speedLabel = useMemo(() => `${Number(speed).toFixed(2)}x`, [speed]);

  const handleSpeak = async () => {
    if (!text.trim()) {
      alert("Digite um texto.");
      return;
    }
    const resp = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // ,"x-site-token": "se-usar-SITE_ACCESS_TOKEN"
      },
      body: JSON.stringify({
        text,
        voice: currentVoice,
        emotion,
        personality,
        targetLanguage
      })
    });
    if (!resp.ok) {
      alert("Falha ao gerar áudio.");
      return;
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = audioRef.current!;
    a.src = url;
    a.playbackRate = Number(speed);
    try { await a.play(); } catch {}
  };

  const playPreview = async (v: Voice) => {
    const r = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Esta é uma prévia da voz ${v.label}.`,
        voice: v.id,
        emotion: "neutral",
        personality: "",
        targetLanguage: ""
      })
    });
    if (!r.ok) { alert("Não foi possível tocar a prévia."); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const aud = new Audio(url);
    aud.playbackRate = Number(speed);
    try { await aud.play(); } catch {}
  };

  const savePreset = () => {
    const name = prompt('Nome do favorito (ex.: "Aula calma - PT-BR"):');
    if (!name) return;
    const p: Preset = {
      id: crypto.randomUUID(),
      name,
      voice: currentVoice,
      emotion,
      personality: personality.trim(),
      targetLanguage,
      speed: Number(speed).toFixed(2)
    };
    setPresets([p, ...presets].slice(0, 40));
    alert("Favorito salvo!");
  };

  const applyPreset = (p: Preset) => {
    setCurrentVoice(p.voice);
    setEmotion(p.emotion);
    setPersonality(p.personality);
    setTargetLanguage(p.targetLanguage);
    setSpeed(p.speed);
    setPresetsOpen(false);
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter(x => x.id !== id));
  };

  // Estilos simples (sem Tailwind p/ facilitar cópia/cola)
  const styles = {
    page: {
      color: "#e5e7eb",
      background:
        "radial-gradient(1200px 800px at 80% -20%, #1f2937 0%, transparent 60%), conic-gradient(from 180deg at 20% 10%, #0ea5e9, #a855f7, #06b6d4, #0ea5e9) fixed",
      backgroundColor: "#0f172a",
      minHeight: "100vh",
      margin: 0,
      fontFamily: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`
    } as React.CSSProperties,
    wrap: {
      maxWidth: 1024,
      margin: "40px auto",
      padding: 24,
      background: "color-mix(in oklab, #111827 90%, black 10%)",
      borderRadius: 20,
      boxShadow: "0 20px 60px rgba(0,0,0,.5)"
    },
    grid: {
      display: "grid",
      gap: 16,
      gridTemplateColumns: "1fr"
    } as React.CSSProperties,
    card: {
      background: "#0b1220",
      border: "1px solid #334155",
      borderRadius: 14,
      padding: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,.25)"
    }
  };

  return (
    <div style={styles.page as any}>
      <div style={styles.wrap}>
        <h1 style={{ marginTop: 0, letterSpacing: ".2px" }}>
          Tradutor com Voz <span style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #334155", borderRadius: 999, background: "#0b1220" }}>TTS + Emoções + Presets</span>
        </h1>

        <div style={styles.grid as any}>
          {/* Coluna esquerda */}
          <div style={styles.card}>
            <label>Texto para falar (já traduzido ou original):</label>
            <textarea
              rows={6}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Digite aqui..."
              style={{ width: "100%", padding: "12px 14px", color: "#e5e7eb", background: "#0b1220", border: "1px solid #374151", borderRadius: 12 }}
            />

            <div style={{ height: 12 }} />
            <label>Idioma alvo (opcional):</label>
            <select
              value={targetLanguage}
              onChange={e => setTargetLanguage(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", color: "#e5e7eb", background: "#0b1220", border: "1px solid #374151", borderRadius: 12 }}
            >
              <option value="">Detectar/manter</option>
              <option value="português do Brasil">Português (Brasil)</option>
              <option value="inglês americano">Inglês (EUA)</option>
              <option value="espanhol latino-americano">Espanhol (LatAm)</option>
              <option value="francês">Francês</option>
              <option value="alemão">Alemão</option>
              <option value="italiano">Italiano</option>
              <option value="japonês">Japonês</option>
            </select>

            <div style={{ height: 12 }} />
            <label>Personalidade do agente (opcional):</label>
            <input
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              placeholder="Ex.: professor paciente, humor leve, formal…"
              style={{ width: "100%", padding: "12px 14px", color: "#e5e7eb", background: "#0b1220", border: "1px solid #374151", borderRadius: 12 }}
            />

            <div style={{ height: 12 }} />
            <label>Velocidade de reprodução: <span style={{ fontSize: 12, padding: "2px 6px", border: "1px solid #334155", borderRadius: 999, background: "#0b1220" }}>{speedLabel}</span></label>
            <input
              type="range" min="0.6" max="1.6" step="0.05"
              value={speed}
              onChange={e => setSpeed(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Coluna direita */}
          <div style={styles.card}>
            {/* Emoções */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { id: "neutral", label: "Neutro" },
                { id: "happy", label: "Feliz" },
                { id: "sad", label: "Triste" },
                { id: "calm", label: "Sereno" },
                { id: "energetic", label: "Energético" }
              ].map(e => (
                <button
                  key={e.id}
                  onClick={() => setEmotion(e.id)}
                  aria-pressed={emotion === e.id}
                  style={{
                    background: "#0b1220",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    padding: "10px 12px",
                    borderRadius: 12,
                    outline: emotion === e.id ? "2px solid #22d3ee" : "none",
                    cursor: "pointer"
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div style={{ height: 12 }} />
            {/* Vozes */}
            <div>
              <button
                onClick={() => { lastFocus.current = document.activeElement as HTMLElement; setVoiceOpen(true); }}
                style={{ padding: "12px 16px", borderRadius: 12, border: "0", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "white", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}
              >
                Escolher voz
              </button>
              <span style={{ marginLeft: 8, fontSize: 12, padding: "4px 8px", border: "1px solid #334155", borderRadius: 999, background: "#0b1220" }}>
                Voz: {currentVoice}
              </span>
            </div>

            <div style={{ height: 12 }} />
            {/* Presets */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={savePreset} style={{ background: "#111827", border: "1px solid #334155", color: "#e5e7eb", padding: "12px 16px", borderRadius: 12, cursor: "pointer" }}>
                Salvar como favorito
              </button>
              <button
                onClick={() => { lastFocus.current = document.activeElement as HTMLElement; setPresetsOpen(true); }}
                style={{ background: "#111827", border: "1px solid #334155", color: "#e5e7eb", padding: "12px 16px", borderRadius: 12, cursor: "pointer" }}
              >
                Favoritos
              </button>
            </div>

            <div style={{ height: 12 }} />
            <button onClick={handleSpeak} style={{ padding: "12px 16px", borderRadius: 12, border: "0", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "white", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
              Gerar & Tocar
            </button>
            <audio ref={audioRef} controls style={{ width: "100%", marginTop: 10 }} />
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 10 }}>
              TTS por OpenAI. Emoções/Personalidade influenciam a reescrita antes da síntese. Velocidade ajustada no player.
            </div>
          </div>
        </div>
      </div>

      {/* MODAL VOZES */}
      {voiceOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setVoiceOpen(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          role="dialog" aria-modal="true" aria-labelledby="voicePickerTitle"
        >
          <div style={{ maxWidth: 920, width: "100%", background: "#0b1220", border: "1px solid #334155", borderRadius: 16, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <h2 id="voicePickerTitle" style={{ margin: 0 }}>Escolher voz</h2>
              <button onClick={() => setVoiceOpen(false)} style={{ background: "#111827", border: "1px solid #334155", color: "#e5e7eb", padding: "10px 12px", borderRadius: 12 }}>Fechar</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
              {voices.map(v => (
                <div key={v.id} style={{ ...styles.card }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{v.label}</h3>
                  {v.note && <p style={{ margin: 0, opacity: 0.85, fontSize: 13 }}>{v.note}</p>}
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <button onClick={() => playPreview(v)} style={{ background: "#111827", border: "1px solid #334155", color: "#e5e7eb", padding: "10px 12px", borderRadius: 12 }}>Prévia</button>
                    <button
                      onClick={() => { setCurrentVoice(v.id); setVoiceOpen(false); }}
                      style={{ padding: "10px 12px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "white", cursor: "pointer" }}
                    >
                      Usar esta voz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRESETS */}
      {presetsOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setPresetsOpen(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          role="dialog" aria-modal="true" aria-labelledby="presetsTitle"
        >
          <div style={{ maxWidth: 920, width: "100%", background: "#0b1220", border: "1px solid #334155", borderRadius: 16, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <h2 id="presetsTitle" style={{ margin: 0 }}>Favoritos</h2>
              <button onClick={() => setPresetsOpen(false)} style={{ background: "#111827", border: "1px solid #334155", color: "#e5e7eb", padding: "10px 12px", borderRadius: 12 }}>Fechar</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
              {presets.length === 0 && (
                <div style={{ ...styles.card }}>
                  <p>Nenhum favorito salvo ainda.</p>
                </div>
              )}
              {presets.map(p => (
                <div key={p.id} style={{ ...styles.card }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{p.name}</h3>
                  <p style={{ margin: 0, opacity: .85, fontSize: 13 }}>
                    <b>Voz:</b> {p.voice} | <b>Emoção:</b> {p.emotion} | <b>Idioma:</b> {p.targetLanguage || "auto"} | <b>Veloc.:</b> {p.speed}x
                  </p>
                  <p style={{ margin: 0, opacity: .85, fontSize: 13 }}>
                    <b>Persona:</b> {p.personality || "(nenhuma)"}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => applyPreset(p)}
                      style={{ padding: "10px 12px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "white", cursor: "pointer" }}
                    >
                      Aplicar
                    </button>
                    <button
                      onClick={() => deletePreset(p.id)}
                      style={{ background: "#111827", border: "1px solid #334155", color: "#e5e7eb", padding: "10px 12px", borderRadius: 12 }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
