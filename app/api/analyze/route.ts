import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
// ffmpeg-static provides a bundled binary so ffmpeg doesn't need to be installed on the host
import ffmpegStatic from 'ffmpeg-static';

const SR = 22050;
const BUF = 2048;
const HOP = 512;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

type Timestamp = {
  timeStart: number;
  timeEnd: number;
  severity: 'low' | 'medium' | 'high';
  detail: string;
};

type MetricResult = {
  score: number;
  label: string;
  timestamps: Timestamp[];
};

type FrameFeatures = {
  time: number;
  rms: number;
  zcr: number;
  spectralCentroid: number;
  spectralFlatness: number;
  spectralSlope: number;
  mfcc: number[];
  chroma: number[];
  subBandEnergies: number[]; // [0-800Hz, 800-2kHz, 2-5kHz, 5-11kHz]
};

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[], m?: number): number {
  if (arr.length < 2) return 0;
  const mu = m ?? mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - mu) ** 2, 0) / arr.length);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function chromaEntropy(chroma: number[]): number {
  const s = chroma.reduce((a, b) => a + b, 0) || 1e-8;
  const p = chroma.map(c => c / s);
  return -p.reduce((acc, pi) => acc + (pi > 1e-8 ? pi * Math.log2(pi) : 0), 0);
}

// Pitch correction detection:
// Natural singing has broad chroma distributions + varying spectral centroid.
// Auto-tuned audio shows unnaturally locked pitch (low chroma entropy) + stable centroid.
function analyzePitchCorrection(frames: FrameFeatures[]): MetricResult {
  if (frames.length < 20) return { score: 0, label: 'Insufficient data', timestamps: [] };

  const centroids = frames.map(f => f.spectralCentroid);
  const entropies = frames.map(f => chromaEntropy(f.chroma));
  const WIN = Math.max(10, Math.round(3 * SR / HOP));
  const timestamps: Timestamp[] = [];
  const windowScores: number[] = [];

  for (let i = WIN; i < frames.length; i++) {
    const winCentroids = centroids.slice(i - WIN, i);
    const winEntropies = entropies.slice(i - WIN, i);

    const centroidStd = std(winCentroids);
    const avgEntropy = mean(winEntropies);

    // Natural music: entropy ~2.2-3.0 bits, centroid std > 0.05
    // Heavy correction: entropy < 1.5, centroid std < 0.02
    const entropyFactor = clamp(1 - avgEntropy / 2.8, 0, 1);
    const varianceFactor = clamp(1 - centroidStd / 0.06, 0, 1);
    const windowScore = 0.55 * entropyFactor + 0.45 * varianceFactor;
    windowScores.push(windowScore);

    if (windowScore > 0.55) {
      const timeStart = frames[i - WIN].time;
      const timeEnd = frames[i].time;
      const last = timestamps[timestamps.length - 1];
      if (!last || timeStart > last.timeEnd + 1.0) {
        const severity: Timestamp['severity'] = windowScore > 0.78 ? 'high' : windowScore > 0.65 ? 'medium' : 'low';
        timestamps.push({
          timeStart,
          timeEnd,
          severity,
          detail: `Pitch quantization — chroma entropy ${avgEntropy.toFixed(2)} bits, centroid σ ${centroidStd.toFixed(3)}`,
        });
      }
    }
  }

  const avgScore = mean(windowScores);
  const score = Math.round(clamp(avgScore * 115, 0, 100));
  const label =
    score < 20 ? 'Natural Intonation' :
    score < 45 ? 'Light Correction' :
    score < 70 ? 'Moderate Correction' : 'Heavy Pitch Processing';

  return { score, label, timestamps: timestamps.slice(0, 25) };
}

// Time alignment detection:
// Human performance has natural timing micro-variations (IOI CV ~10-25%).
// Grid-quantized tracks show IOI coefficient of variation < 4%.
function analyzeTimeAlignment(frames: FrameFeatures[]): MetricResult {
  if (frames.length < 30) return { score: 0, label: 'Insufficient data', timestamps: [] };

  const rmsValues = frames.map(f => f.rms);
  const rmsThreshold = mean(rmsValues) * 1.5;
  const minDist = Math.max(3, Math.round(0.08 * SR / HOP));

  const peaks: number[] = [];
  for (let i = 1; i < rmsValues.length - 1; i++) {
    if (
      rmsValues[i] > rmsThreshold &&
      rmsValues[i] >= rmsValues[i - 1] &&
      rmsValues[i] >= rmsValues[i + 1]
    ) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDist) {
        peaks.push(i);
      }
    }
  }

  if (peaks.length < 6) return { score: 0, label: 'Insufficient onsets', timestamps: [] };

  const iois = peaks.slice(1).map((p, i) => (p - peaks[i]) * HOP / SR);
  const timestamps: Timestamp[] = [];
  const windowScores: number[] = [];
  const winBeats = 8;

  for (let i = winBeats; i < iois.length; i++) {
    const winIois = iois.slice(i - winBeats, i);
    const m = mean(winIois);
    const cv = m > 0.001 ? std(winIois, m) / m : 1;
    // Natural: CV 0.10-0.30, Quantized: CV < 0.04
    const quantScore = clamp((0.12 - cv) / 0.12, 0, 1);
    windowScores.push(quantScore);

    if (quantScore > 0.6) {
      const timeStart = frames[peaks[i - winBeats]]?.time ?? 0;
      const timeEnd = frames[peaks[i]]?.time ?? frames[frames.length - 1].time;
      const last = timestamps[timestamps.length - 1];
      if (!last || timeStart > last.timeEnd + 1.0) {
        const severity: Timestamp['severity'] = quantScore > 0.85 ? 'high' : quantScore > 0.72 ? 'medium' : 'low';
        timestamps.push({
          timeStart,
          timeEnd,
          severity,
          detail: `Timing grid-lock — IOI variance ${(cv * 100).toFixed(1)}% (natural > 10%)`,
        });
      }
    }
  }

  const score = Math.round(clamp(mean(windowScores) * 100, 0, 100));
  const label =
    score < 20 ? 'Natural Groove' :
    score < 45 ? 'Mild Alignment' :
    score < 70 ? 'Grid-Snapped' : 'Heavily Quantized';

  return { score, label, timestamps: timestamps.slice(0, 25) };
}

// AI generation detection:
// Targets neural audio synthesis fingerprints (Suno/Udio/EnCodec/DAC), NOT post-processing
// artifacts. Neural synthesis gets pitch/timing right but betrays itself through:
//   1. Frozen fine spectral texture (high-order MFCCs barely move relative to coarse MFCCs)
//   2. Too-regular frame-to-frame spectral transitions (low delta burstiness)
//   3. Unnaturally stable high-frequency sub-bands (5–11 kHz)
//   4. Consistent spectral tilt (slope doesn't fluctuate as real instruments enter/exit)
function analyzeAIGeneration(frames: FrameFeatures[]): MetricResult {
  if (frames.length < 20) return { score: 0, label: 'Insufficient data', timestamps: [] };

  // --- 1. MFCC texture ratio ---
  // Low-order MFCCs (1–3): broad spectral shape — AI gets this right, so it varies normally.
  // High-order MFCCs (7–12): fine spectral texture — AI freezes these unnaturally.
  // Natural ratio (high-std / low-std) ≥ 0.20;  neural synthesis < 0.12.
  const lowMfccStds: number[] = [];
  const highMfccStds: number[] = [];
  for (let c = 1; c <= 3; c++) lowMfccStds.push(std(frames.map(f => f.mfcc[c] ?? 0)));
  for (let c = 7; c <= 12; c++) highMfccStds.push(std(frames.map(f => f.mfcc[c] ?? 0)));
  const avgLow = mean(lowMfccStds);
  const avgHigh = mean(highMfccStds);
  const textureRatio = avgLow > 0.5 ? avgHigh / avgLow : 1.0;
  const mfccTextureFactor = clamp(1 - textureRatio / 0.18, 0, 1);

  // --- 2. MFCC delta burstiness ---
  // Human performances: irregular spectral jumps (high delta coefficient of variation).
  // Neural synthesis: transitions are too smooth and uniform (low delta CV).
  // Natural CV > 0.55;  AI < 0.30.
  const deltas: number[] = [];
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].mfcc;
    const curr = frames[i].mfcc;
    const d = Math.sqrt(curr.reduce((acc, v, j) => acc + (v - (prev[j] ?? 0)) ** 2, 0));
    if (isFinite(d)) deltas.push(d);
  }
  const deltaMean = mean(deltas);
  const deltaCV = deltaMean > 0.5 ? std(deltas) / deltaMean : 1.0;
  const deltaFactor = clamp(1 - deltaCV / 0.50, 0, 1);

  // --- 3. Sub-band temporal stability ---
  // Real music: high-frequency bands (2–11 kHz) vary energetically with the arrangement.
  // Neural synthesis: generates a suspiciously steady high-freq texture.
  // Check: (high-band CV) / (low-band CV) — natural > 0.50, AI < 0.25.
  const lowBandEnergies = frames.map(f => f.subBandEnergies[0] + f.subBandEnergies[1]);
  const highBandEnergies = frames.map(f => f.subBandEnergies[2] + f.subBandEnergies[3]);
  const lowBandMean = mean(lowBandEnergies);
  const highBandMean = mean(highBandEnergies);
  const lowCV = lowBandMean > 1e-10 ? std(lowBandEnergies) / lowBandMean : 1.0;
  const highCV = highBandMean > 1e-10 ? std(highBandEnergies) / highBandMean : 1.0;
  const cvRatio = lowCV > 0.01 ? highCV / lowCV : 1.0;
  const subBandFactor = clamp(1 - cvRatio / 0.45, 0, 1);

  // --- 4. Spectral slope variance ---
  // Natural audio: tonal balance shifts as instruments enter/exit (high slope variance).
  // Neural synthesis: spectral tilt stays too consistent across the track.
  // Natural normalised std > 0.12;  AI < 0.05.
  const slopes = frames.map(f => f.spectralSlope).filter(v => isFinite(v) && v !== 0);
  let slopeFactor = 0;
  if (slopes.length > 10) {
    const absSlopes = slopes.map(Math.abs);
    const normStd = mean(absSlopes) > 1e-10 ? std(slopes) / mean(absSlopes) : 1.0;
    slopeFactor = clamp(1 - normStd / 0.10, 0, 1);
  }

  const overallFactor =
    0.40 * mfccTextureFactor +
    0.25 * deltaFactor +
    0.25 * subBandFactor +
    0.10 * slopeFactor;
  const score = Math.round(clamp(overallFactor * 100, 0, 100));

  // Flag windows where the MFCC texture freeze is strongest
  const WIN = Math.max(10, Math.round(5 * SR / HOP));
  const timestamps: Timestamp[] = [];
  for (let i = WIN; i < frames.length; i += Math.floor(WIN / 2)) {
    const win = frames.slice(Math.max(0, i - WIN), i);
    const wLow = mean([1, 2, 3].map(c => std(win.map(f => f.mfcc[c] ?? 0))));
    const wHigh = mean([7, 8, 9, 10, 11, 12].map(c => std(win.map(f => f.mfcc[c] ?? 0))));
    const wRatio = wLow > 0.5 ? wHigh / wLow : 1.0;
    if (wRatio < 0.12 && wLow > 0.5) {
      const timeStart = win[0].time;
      const timeEnd = win[win.length - 1].time;
      const last = timestamps[timestamps.length - 1];
      if (!last || timeStart > last.timeEnd + 1.0) {
        const severity: Timestamp['severity'] = wRatio < 0.06 ? 'high' : wRatio < 0.09 ? 'medium' : 'low';
        timestamps.push({
          timeStart,
          timeEnd,
          severity,
          detail: `Neural texture fingerprint — MFCC fine/coarse ratio ${wRatio.toFixed(3)} (natural > 0.20)`,
        });
      }
    }
  }

  const label =
    score < 20 ? 'Organic Recording' :
    score < 45 ? 'Some Processing' :
    score < 70 ? 'Heavy Synthesis' : 'AI-Generated Characteristics';

  return { score, label, timestamps: timestamps.slice(0, 25) };
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score < 18) return 'A';
  if (score < 38) return 'B';
  if (score < 58) return 'C';
  if (score < 75) return 'D';
  return 'F';
}

function downsampleRMS(values: number[], target: number): number[] {
  if (!values.length) return new Array(target).fill(0);
  const step = values.length / target;
  const result: number[] = [];
  for (let i = 0; i < target; i++) {
    const s = Math.floor(i * step);
    const e = Math.floor((i + 1) * step);
    const slice = values.slice(s, e);
    result.push(slice.length ? mean(slice) : 0);
  }
  const max = Math.max(...result) || 1e-8;
  return result.map(v => v / max);
}

function buildRegions(
  duration: number,
  pitch: Timestamp[],
  time: Timestamp[],
  ai: Timestamp[]
): Array<{ start: number; end: number; color: string }> {
  const SEG = 0.5;
  const n = Math.ceil(duration / SEG);
  return Array.from({ length: n }, (_, i) => {
    const start = i * SEG;
    const end = Math.min(start + SEG, duration);
    const inRange = (ts: Timestamp[]) => ts.some(t => t.timeStart < end && t.timeEnd > start);
    const highSev = (ts: Timestamp[]) => ts.some(t => t.timeStart < end && t.timeEnd > start && t.severity === 'high');
    const hasAI = inRange(ai);
    const hasPitch = inRange(pitch);
    const hasTime = inRange(time);
    let color = 'clean';
    if (highSev(ai) || (highSev(pitch) && highSev(time))) color = 'critical';
    else if (hasAI || (hasPitch && hasTime)) color = 'warning';
    else if (hasPitch || hasTime) color = 'caution';
    return { start, end, color };
  });
}

export async function POST(request: Request) {
  const id = randomUUID();
  const inputPath = join(tmpdir(), `hfy_in_${id}`);
  const outputPath = join(tmpdir(), `hfy_out_${id}.raw`);

  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File | null;

    if (!file) return Response.json({ error: 'No audio file provided.' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return Response.json({ error: 'File too large (max 100 MB).' }, { status: 400 });
    if (!file.name.match(/\.(mp3|wav)$/i)) return Response.json({ error: 'Upload MP3 or WAV only.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    writeFileSync(inputPath, Buffer.from(bytes));

    const ffmpegBin = ffmpegStatic ?? 'ffmpeg';
    execSync(
      `"${ffmpegBin}" -i "${inputPath}" -ac 1 -ar ${SR} -f f32le -y "${outputPath}"`,
      { timeout: 120_000, stdio: 'ignore' }
    );

    const raw = readFileSync(outputPath);
    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    const samples = new Float32Array(raw.byteLength / 4);
    for (let i = 0; i < samples.length; i++) samples[i] = view.getFloat32(i * 4, true);

    const duration = samples.length / SR;

    // Dynamic import keeps meyda out of the client bundle
    const { default: Meyda } = await import('meyda');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Meyda as any).sampleRate = SR;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Meyda as any).bufferSize = BUF;

    const maxFrames = Math.min(
      Math.floor((samples.length - BUF) / HOP),
      Math.round(360 * SR / HOP) // cap at 6 minutes
    );

    const frames: FrameFeatures[] = [];
    for (let i = 0; i < maxFrames; i++) {
      const s = i * HOP;
      const frame = samples.slice(s, s + BUF);
      const frameRms = Math.sqrt(frame.reduce((a, v) => a + v * v, 0) / frame.length);
      if (frameRms < 0.0008) continue; // skip silence

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feat = (Meyda as any).extract(
          ['rms', 'zcr', 'spectralCentroid', 'spectralFlatness', 'spectralSlope', 'mfcc', 'chroma', 'powerSpectrum'],
          frame
        );
        if (!feat) continue;

        // Compute sub-band mean energies from power spectrum (avoids storing 1025 floats/frame)
        const ps: number[] = feat.powerSpectrum ? Array.from(feat.powerSpectrum as Float32Array) : [];
        const BIN_HZ = SR / BUF; // ≈ 10.77 Hz/bin
        const b0 = 0;
        const b1 = Math.round(800 / BIN_HZ);
        const b2 = Math.round(2000 / BIN_HZ);
        const b3 = Math.round(5000 / BIN_HZ);
        const b4 = ps.length;
        const bandMean = (lo: number, hi: number) => {
          const n = Math.min(hi, b4) - lo;
          if (n <= 0) return 0;
          let sum = 0;
          for (let k = lo; k < Math.min(hi, b4); k++) sum += ps[k];
          return sum / n;
        };

        frames.push({
          time: s / SR,
          rms: isFinite(feat.rms) ? feat.rms : 0,
          zcr: isFinite(feat.zcr) ? feat.zcr : 0,
          spectralCentroid: isFinite(feat.spectralCentroid) ? feat.spectralCentroid : 0,
          spectralFlatness: isFinite(feat.spectralFlatness) ? feat.spectralFlatness : 0,
          spectralSlope: isFinite(feat.spectralSlope) ? feat.spectralSlope : 0,
          mfcc: Array.isArray(feat.mfcc) ? feat.mfcc.map((v: number) => isFinite(v) ? v : 0) : new Array(13).fill(0),
          chroma: Array.isArray(feat.chroma) ? feat.chroma.map((v: number) => isFinite(v) ? v : 0) : new Array(12).fill(0),
          subBandEnergies: [
            bandMean(b0, b1), // 0–800 Hz
            bandMean(b1, b2), // 800 Hz–2 kHz
            bandMean(b2, b3), // 2–5 kHz
            bandMean(b3, b4), // 5–11 kHz
          ],
        });
      } catch { /* skip bad frame */ }
    }

    if (frames.length < 10) return Response.json({ error: 'Audio too short or silent for analysis.' }, { status: 400 });

    const pitchCorrection = analyzePitchCorrection(frames);
    const timeAlignment = analyzeTimeAlignment(frames);
    const aiGeneration = analyzeAIGeneration(frames);

    const overallScore = 0.38 * pitchCorrection.score + 0.35 * timeAlignment.score + 0.27 * aiGeneration.score;
    const grade = scoreToGrade(overallScore);
    const overallPurity = Math.round(100 - overallScore);
    const waveformData = downsampleRMS(frames.map(f => f.rms), 900);
    const regions = buildRegions(duration, pitchCorrection.timestamps, timeAlignment.timestamps, aiGeneration.timestamps);

    return Response.json({
      duration,
      fileName: file.name,
      grade,
      overallPurity,
      pitchCorrection,
      timeAlignment,
      aiGeneration,
      waveformData,
      regions,
    });
  } catch (err) {
    console.error('[analyze]', err);
    return Response.json({ error: 'Analysis failed. Ensure the file is a valid MP3 or WAV.' }, { status: 500 });
  } finally {
    [inputPath, outputPath].forEach(p => { try { if (existsSync(p)) unlinkSync(p); } catch { /* ignore */ } });
  }
}
