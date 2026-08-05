import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sampleRate = 24_000;
const tempo = 150;
const beat = 60 / tempo;
const bars = 24;
const duration = bars * 4 * beat;
const length = Math.ceil(duration * sampleRate);
const left = new Float32Array(length);
const right = new Float32Array(length);

let randomState = 0x41534345;
const random = () => {
  randomState = (1664525 * randomState + 1013904223) >>> 0;
  return randomState / 0xffffffff;
};

const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function addStereo(index, value, pan = 0) {
  if (index < 0 || index >= length) return;
  const angle = (clamp(pan, -1, 1) + 1) * Math.PI / 4;
  left[index] += value * Math.cos(angle);
  right[index] += value * Math.sin(angle);
}

function addKick(time, gain = 1) {
  const start = Math.floor(time * sampleRate);
  const size = Math.floor(0.34 * sampleRate);
  let phase = 0;
  for (let i = 0; i < size && start + i < length; i += 1) {
    const t = i / sampleRate;
    const frequency = 43 + 115 * Math.exp(-t * 31);
    phase += (Math.PI * 2 * frequency) / sampleRate;
    const body = Math.sin(phase) * Math.exp(-t * 11.5);
    const click = (random() * 2 - 1) * Math.exp(-t * 90) * 0.18;
    addStereo(start + i, (body + click) * gain * 0.92);
  }
}

function addSnare(time, gain = 1) {
  const start = Math.floor(time * sampleRate);
  const size = Math.floor(0.28 * sampleRate);
  let previous = 0;
  for (let i = 0; i < size && start + i < length; i += 1) {
    const t = i / sampleRate;
    const noise = random() * 2 - 1;
    const bright = noise - previous * 0.78;
    previous = noise;
    const tone = Math.sin(Math.PI * 2 * 185 * t) * Math.exp(-t * 22);
    const envelope = Math.exp(-t * 15);
    const pan = i % 2 === 0 ? -0.12 : 0.12;
    addStereo(start + i, (bright * 0.38 + tone * 0.32) * envelope * gain, pan);
  }
}

function addHat(time, gain = 1, pan = 0) {
  const start = Math.floor(time * sampleRate);
  const size = Math.floor(0.075 * sampleRate);
  let low = 0;
  for (let i = 0; i < size && start + i < length; i += 1) {
    const t = i / sampleRate;
    const noise = random() * 2 - 1;
    low += (noise - low) * 0.11;
    const high = noise - low;
    addStereo(start + i, high * Math.exp(-t * 55) * gain * 0.25, pan);
  }
}

function addCowbell(time, note, gain = 1, pan = 0) {
  const start = Math.floor(time * sampleRate);
  const size = Math.floor(0.23 * sampleRate);
  const frequency = midi(note);
  for (let i = 0; i < size && start + i < length; i += 1) {
    const t = i / sampleRate;
    const envelope = (1 - Math.exp(-t * 180)) * Math.exp(-t * 17);
    const metallic = Math.sin(Math.PI * 2 * frequency * t)
      + 0.52 * Math.sin(Math.PI * 2 * frequency * 1.48 * t + 0.35)
      + 0.18 * Math.sin(Math.PI * 2 * frequency * 2.31 * t);
    addStereo(start + i, Math.tanh(metallic * 1.4) * envelope * gain * 0.32, pan);
  }
}

function addBass(time, note, beatsLong = 0.85, gain = 1, slideTo = null) {
  const start = Math.floor(time * sampleRate);
  const size = Math.floor(beatsLong * beat * sampleRate);
  let phase = 0;
  const startFrequency = midi(note);
  const endFrequency = slideTo == null ? startFrequency : midi(slideTo);
  for (let i = 0; i < size && start + i < length; i += 1) {
    const t = i / sampleRate;
    const progress = i / Math.max(1, size - 1);
    const frequency = startFrequency * (endFrequency / startFrequency) ** (progress ** 1.8);
    phase += (Math.PI * 2 * frequency) / sampleRate;
    const attack = Math.min(1, t * 85);
    const release = Math.max(0, 1 - progress ** 2.4);
    const wave = Math.sin(phase) + 0.28 * Math.sin(phase * 2) + 0.11 * Math.sin(phase * 3);
    addStereo(start + i, Math.tanh(wave * 1.8) * attack * release * gain * 0.58);
  }
}

function addPad(time, notes, gain = 1) {
  const start = Math.floor(time * sampleRate);
  const size = Math.floor(4.15 * beat * sampleRate);
  const frequencies = notes.map(midi);
  for (let i = 0; i < size && start + i < length; i += 1) {
    const t = i / sampleRate;
    const progress = i / Math.max(1, size - 1);
    const envelope = Math.min(1, t / 0.42) * Math.min(1, (1 - progress) / 0.2);
    let l = 0;
    let r = 0;
    for (let n = 0; n < frequencies.length; n += 1) {
      const frequency = frequencies[n];
      for (let harmonic = 1; harmonic <= 5; harmonic += 1) {
        const weight = 1 / harmonic;
        l += Math.sin(Math.PI * 2 * frequency * harmonic * t * 0.997) * weight;
        r += Math.sin(Math.PI * 2 * frequency * harmonic * t * 1.003 + n * 0.22) * weight;
      }
    }
    left[start + i] += l * envelope * gain * 0.018;
    right[start + i] += r * envelope * gain * 0.018;
  }
}

function addRiser(time, beatsLong = 4, gain = 1) {
  const start = Math.floor(time * sampleRate);
  const size = Math.floor(beatsLong * beat * sampleRate);
  let low = 0;
  for (let i = 0; i < size && start + i < length; i += 1) {
    const progress = i / Math.max(1, size - 1);
    const noise = random() * 2 - 1;
    const smoothing = 0.015 + progress * 0.38;
    low += (noise - low) * smoothing;
    const value = (noise - low * 0.3) * progress ** 2 * gain * 0.13;
    addStereo(start + i, value, Math.sin(progress * Math.PI * 5) * 0.45);
  }
}

const roots = [42, 38, 45, 40];
const chords = [
  [54, 57, 61, 66],
  [50, 54, 57, 62],
  [57, 61, 64, 69],
  [52, 56, 59, 64],
];
const motif = [78, 81, 85, 83, 78, 76, 73, 76];
const kickPattern = [0, 0.75, 2, 2.5, 3.25];

for (let bar = 0; bar < bars; bar += 1) {
  const barTime = bar * 4 * beat;
  const chordIndex = bar % 4;
  const isIntro = bar < 4;
  const isBuild = bar >= 4 && bar < 8;
  const isDrop = (bar >= 8 && bar < 16) || bar >= 20;
  const isBreak = bar >= 16 && bar < 20;

  addPad(barTime, chords[chordIndex], isDrop ? 0.82 : isBreak ? 1.08 : 0.54);

  const cowbellStep = isIntro ? 1 : 0.5;
  for (let position = 0; position < 4; position += cowbellStep) {
    const step = Math.round(position * 2);
    const note = motif[(bar * 3 + step) % motif.length] + (isBreak ? -12 : 0);
    const emphasis = step % 4 === 0 ? 1 : 0.72;
    addCowbell(barTime + position * beat, note, (isIntro ? 0.38 : isBreak ? 0.45 : 0.9) * emphasis, step % 2 ? 0.28 : -0.28);
  }

  if (!isIntro) {
    const hatsPerBeat = isDrop ? 4 : 2;
    for (let step = 0; step < 4 * hatsPerBeat; step += 1) {
      if (!isDrop && step % 2 === 1) continue;
      addHat(barTime + (step / hatsPerBeat) * beat, step % hatsPerBeat === 0 ? 0.85 : 0.46, step % 2 ? 0.34 : -0.34);
    }
    addSnare(barTime + beat, isDrop ? 0.94 : 0.7);
    addSnare(barTime + 3 * beat, isDrop ? 1 : 0.76);
  }

  if (isBuild) {
    addKick(barTime, 0.65);
    addKick(barTime + 2 * beat, 0.75);
    addBass(barTime, roots[chordIndex] - 12, 1.7, 0.66);
  }

  if (isDrop) {
    for (const position of kickPattern) addKick(barTime + position * beat, position === 0 ? 1.06 : 0.88);
    addBass(barTime, roots[chordIndex] - 12, 0.9, 1.03);
    addBass(barTime + 1.5 * beat, roots[chordIndex] - 12, 0.42, 0.78, roots[(chordIndex + 1) % 4] - 12);
    addBass(barTime + 2 * beat, roots[chordIndex] - 12, 1.25, 0.96);
    addBass(barTime + 3.25 * beat, roots[chordIndex] - 12, 0.55, 0.84);
  }

  if (isBreak) {
    addBass(barTime, roots[chordIndex] - 12, 3.25, 0.48);
    if (bar === 19) addRiser(barTime, 4, 1.25);
  }

  if (bar === 7) addRiser(barTime, 4, 1.1);
}

const delayA = Math.floor(0.19 * sampleRate);
const delayB = Math.floor(0.37 * sampleRate);
for (let i = delayB; i < length; i += 1) {
  left[i] += right[i - delayA] * 0.085 + left[i - delayB] * 0.045;
  right[i] += left[i - delayA] * 0.085 + right[i - delayB] * 0.045;
}

let peak = 0;
for (let i = 0; i < length; i += 1) {
  left[i] = Math.tanh(left[i] * 1.18);
  right[i] = Math.tanh(right[i] * 1.18);
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}

const target = 0.91 / Math.max(peak, 0.001);
const fadeIn = Math.floor(0.06 * sampleRate);
const fadeOut = Math.floor(0.42 * sampleRate);
for (let i = 0; i < length; i += 1) {
  const startFade = Math.min(1, i / fadeIn);
  const endFade = Math.min(1, (length - 1 - i) / fadeOut);
  const gain = target * Math.min(startFade, endFade);
  left[i] *= gain;
  right[i] *= gain;
}

const bytesPerSample = 2;
const channels = 2;
const dataSize = length * channels * bytesPerSample;
const wav = Buffer.alloc(44 + dataSize);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVE", 8);
wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(channels, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
wav.writeUInt16LE(channels * bytesPerSample, 32);
wav.writeUInt16LE(bytesPerSample * 8, 34);
wav.write("data", 36);
wav.writeUInt32LE(dataSize, 40);

for (let i = 0; i < length; i += 1) {
  const offset = 44 + i * 4;
  wav.writeInt16LE(Math.round(clamp(left[i], -1, 1) * 32767), offset);
  wav.writeInt16LE(Math.round(clamp(right[i], -1, 1) * 32767), offset + 2);
}

const output = resolve("public/ascender-night-drive.wav");
await mkdir(dirname(output), { recursive: true });
await writeFile(output, wav);
console.log(`Generated ${output} (${duration.toFixed(1)}s, ${(wav.length / 1024 / 1024).toFixed(2)} MiB)`);
