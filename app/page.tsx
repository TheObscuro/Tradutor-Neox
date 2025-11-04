"use client";
import { useEffect, useRef, useState } from "react";

type Voice = { id: string; label: string; note?: string };

async function playBlobWithEmotion(blob: Blob, emotion: string) {
  // Reproduz com Web Audio alterando apenas prosódia (pitch/velocidade/ganho)
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuf = await blob.arrayBuffer();
  const audioBuf = await ctx.decodeAudioData(arrayBuf);

  const source = ctx.createBufferSource();
  source.buffer = audioBuf;

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "peaking";
  filter.frequency.value = 200;   // realça leve graves para "triste", etc.
  filter.Q.value = 0.7;
  filter.gain.value = 0;

  // defaults
  let rate = 1.0;
  let detune = 0; // cents (-100 = -1 semitom)
  let gainDb = 0;
  let filterGain = 0;

  switch (emotion) {
    case "happy":
      rate = 1.10;
      detune = +100;
      gainDb = +1.5;
      filterGain = -2; // tira um pouco de grave
      break;
    case "sad":
      rate = 0.90;
      detune = -100;
      gainDb = -2.0;
      filterGain = +2; // dá calor nos graves
      break;
    case "calm":
      rate = 0.95;
      detune = 0;
      gainDb = 0;
      filterGain = +1;
      break;
    case "energetic":
      rate = 1.20;
      detune = +50;
      gainDb = +2.0;
      filterGain = -1;
      break;
    case "neutral":
    default:
      // nada
      break;
  }

  // aplica
  source.playbackRate.value = rate;
  // nem todos browsers suportam detune; ignore se não houver
  try { (source as any).detune?.setValueAtTime?.(detune, ctx.currentTime); } catch {}

  // converte dB para linear
  gain.gain.value = Math.pow(10, gainDb / 20);
  filter.gain.value = filterGain;

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(0);
}

export default function Page() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [personality, setPersonality] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [currentVoice, setCurrentVoice] = useState("alloy");
  const [emotion, setEmotion] = useState("neutral");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const languages = [
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
    "Vietnamita",
  ];

  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => setVoices(data.voices))
      .catch(() => alert("Erro ao carregar vozes"));
  }, []);

  const handleSpeak = async () => {
  if (!text.trim()) { alert("Digite um texto."); return; }
  setLoading(true);
  setTranslated("");

  try {
    // 1) traduz primeiro (se idioma escolhido)
    let textToSpeak = text;
    if (targetLanguage && targetLanguage.trim()) {
      const tr = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage })
      });
      if (!tr.ok) {
        const msg = await tr.text().catch(() => "");
        alert(`Falha ao traduzir: ${msg}`);
        setLoading(false);
        return;
      }
      const data = await tr.json();
      textToSpeak = data.translated || text;
      setTranslated(textToSpeak); // mostra a tradução na tela
    }

    // 2) pede o áudio (sem emoção no backend)
    const resp = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToSpeak, voice: currentVoice })
    });

    const ct = resp.headers.get("content-type") || "";
    if (!resp.ok || !ct.includes("audio/")) {
      const errText = await resp.text().catch(() => "");
      alert(`Erro no TTS: ${errText || ct}`);
      return;
    }

    const blob = await resp.blob();

    // 3) reprodução: se emoção ≠ neutro, usa WebAudio pra afetar só a voz
    if (emotion !== "neutral") {
      await playBlobWithEmotion(blob, emotion);
    } else {
      // neutro: usa <audio> normal
      const url = URL.createObjectURL(blob);
      audioRef.current!.src = url;
      await audioRef.current!.play().catch(() => {});
    }
  } catch (e) {
    console.error(e);
    alert("Erro ao traduzir/gerar áudio.");
  } finally {
    setLoading(false);
  }
};


  const styles = {
    page: {
      color: "#e5e7eb",
      background:
        "linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #3b82f6 120%)",
      minHeight: "100vh",
      padding: "40px 16px",
    } as React.CSSProperties,
    card: {
      maxWidth: 800,
      margin: "0 auto",
      background: "#0b1220",
      border: "1px solid #334155",
      borderRadius: 16,
      padding: 20,
      boxShadow: "0 10px 30px rgba(0,0,0,.4)",
    } as React.CSSProperties,
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ textAlign: "center" }}>Tradutor com Voz 🎙️</h1>

        <label>Texto original:</label>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o texto..."
          style={{
            width: "100%",
            background: "#0f172a",
            color: "#e5e7eb",
            border: "1px solid #475569",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 12,
          }}
        />

        <label>Idioma de tradução:</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={{
            width: "100%",
            background: "#0f172a",
            color: "#e5e7eb",
            border: "1px solid #475569",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 16,
          }}
        >
          <option value="">Sem tradução</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <label>Personalidade (opcional):</label>
        <input
          type="text"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="Ex: voz calma, engraçada..."
          style={{
            width: "100%",
            background: "#0f172a",
            color: "#e5e7eb",
            border: "1px solid #475569",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 12,
          }}
        />

        <label>Emoção:</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {[
            { id: "neutral", label: "Neutro" },
            { id: "happy", label: "Feliz" },
            { id: "sad", label: "Triste" },
            { id: "calm", label: "Sereno" },
            { id: "energetic", label: "Energético" },
          ].map((e) => (
            <button
              key={e.id}
              onClick={() => setEmotion(e.id)}
              style={{
                flex: 1,
                background:
                  emotion === e.id
                    ? "linear-gradient(135deg,#06b6d4,#8b5cf6)"
                    : "#0f172a",
                color: emotion === e.id ? "white" : "#e5e7eb",
                border: "1px solid #475569",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {e.label}
            </button>
          ))}
        </div>

        <label>Voz:</label>
        <select
          value={currentVoice}
          onChange={(e) => setCurrentVoice(e.target.value)}
          style={{
            width: "100%",
            background: "#0f172a",
            color: "#e5e7eb",
            border: "1px solid #475569",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 16,
          }}
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} — {v.note}
            </option>
          ))}
        </select>

        <button
          onClick={handleSpeak}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
            color: "white",
            fontWeight: "bold",
            border: 0,
            borderRadius: 12,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,.35)",
          }}
        >
          {loading ? "Gerando..." : "Traduzir & Falar"}
        </button>

        <audio ref={audioRef} controls style={{ width: "100%", marginTop: 16 }} />

        {translated && (
          <div style={{ marginTop: 20 }}>
            <h3>Tradução:</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{translated}</p>
          </div>
        )}
      </div>
    </div>
  );
}
