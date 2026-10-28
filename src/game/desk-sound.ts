import type { Settings } from "./types";
let context: AudioContext | null = null;
// Efeitos curtos sintetizados localmente; nenhum arquivo ou serviço externo.
export function deskSound(
  kind: "paper" | "envelope" | "stamp" | "phone",
  settings: Settings,
) {
  if (!settings.sound || settings.volume <= 0 || typeof window === "undefined")
    return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    void ctx.resume().catch(() => {});
    const at = ctx.currentTime,
      duration = kind === "phone" ? 0.3 : kind === "envelope" ? 0.22 : 0.13;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(
      Math.max(0.0001, Math.min(1, settings.volume) * 0.075),
      at,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    gain.connect(ctx.destination);
    if (kind === "paper" || kind === "envelope") {
      const buffer = ctx.createBuffer(
          1,
          Math.ceil(ctx.sampleRate * duration),
          ctx.sampleRate,
        ),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] =
          (Math.random() * 2 - 1) *
          (kind === "envelope" ? Math.sin(i * 0.08) ** 2 : 0.6);
      const source = ctx.createBufferSource(),
        filter = ctx.createBiquadFilter();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = kind === "paper" ? 1400 : 2200;
      source.connect(filter);
      filter.connect(gain);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      source.start(at);
      source.stop(at + duration);
    } else {
      const oscillator = ctx.createOscillator();
      oscillator.type = kind === "stamp" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(kind === "stamp" ? 145 : 680, at);
      oscillator.frequency.exponentialRampToValueAtTime(
        kind === "stamp" ? 45 : 520,
        at + duration,
      );
      oscillator.connect(gain);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(at);
      oscillator.stop(at + duration);
    }
  } catch {
    /* Um navegador sem áudio autorizado continua com o jogo funcional. */
  }
}
