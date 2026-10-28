"use client";
import { useEffect } from "react";
import { useGame } from "../game/store";
export default function Ambience() {
  const { sound, volume } = useGame((s) => s.settings);
  useEffect(() => {
    if (!sound || volume === 0) return;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = volume * 0.035;
    gain.connect(ctx.destination);
    const low = ctx.createOscillator();
    low.frequency.value = 55;
    low.type = "sine";
    low.connect(gain);
    low.start();
    const noise = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate),
      channel = noise.getChannelData(0);
    for (let i = 0; i < channel.length; i++)
      channel[i] = (Math.random() * 2 - 1) * 0.25;
    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 350;
    source.connect(filter);
    filter.connect(gain);
    source.start();
    void ctx.resume();
    return () => {
      source.stop();
      low.stop();
      void ctx.close();
    };
  }, [sound, volume]);
  return null;
}
