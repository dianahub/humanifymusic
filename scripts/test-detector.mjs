#!/usr/bin/env node
// Audio purity detector test harness
//
// Usage:
//   node scripts/test-detector.mjs                           # local dev server
//   node scripts/test-detector.mjs https://your.railway.app # Railway deploy
//
// Place labelled samples in:
//   test-samples/ai/    ← songs you know are AI-generated
//   test-samples/human/ ← songs you know are by real artists
//
// Supported formats: .mp3, .wav

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SAMPLES = join(ROOT, 'test-samples');
const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const ENDPOINT = `${BASE}/api/analyze`;

// ── helpers ──────────────────────────────────────────────────────────────────

function getAudioFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => ['.mp3', '.wav'].includes(extname(f).toLowerCase()))
    .sort()
    .map(f => join(dir, f));
}

async function analyzeFile(filePath) {
  const name = basename(filePath);
  const bytes = readFileSync(filePath);
  const mime = name.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
  const form = new FormData();
  form.append('audio', new Blob([bytes], { type: mime }), name);
  const res = await fetch(ENDPOINT, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? res.statusText);
  return json;
}

const pad  = (v, n) => String(typeof v === 'number' ? Math.round(v) : v).padStart(n);
const avg  = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const sdev = arr => {
  if (arr.length < 2) return 0;
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
};

function row(name, pitch, time, ai, purity, extra = '') {
  return (
    `  ${name.slice(0, 36).padEnd(36)} ` +
    `pitch=${pad(pitch, 3)}  time=${pad(time, 3)}  ai=${pad(ai, 3)}  purity=${pad(purity, 3)}%` +
    (extra ? `  ${extra}` : '')
  );
}

// ── per-group runner ──────────────────────────────────────────────────────────

async function runGroup(label, files) {
  const results = [];
  const hr = '─'.repeat(82);

  console.log(`\n${label.toUpperCase()} SONGS  (${files.length} file${files.length !== 1 ? 's' : ''})`);
  console.log(hr);

  if (!files.length) {
    console.log(`  No files found — add .mp3/.wav to test-samples/${label.toLowerCase()}/`);
    return results;
  }

  for (const f of files) {
    const name = basename(f);
    process.stdout.write(`  ${name.slice(0, 36).padEnd(36)} ... `);
    try {
      const r = await analyzeFile(f);
      results.push({ name, ...r });
      console.log(
        `pitch=${pad(r.pitchCorrection.score, 3)}  ` +
        `time=${pad(r.timeAlignment.score, 3)}  ` +
        `ai=${pad(r.aiGeneration.score, 3)}  ` +
        `grade=${r.grade}  purity=${pad(r.overallPurity, 3)}%`
      );
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }

  if (results.length) {
    console.log(hr);
    const pitch  = results.map(r => r.pitchCorrection.score);
    const time   = results.map(r => r.timeAlignment.score);
    const ai     = results.map(r => r.aiGeneration.score);
    const purity = results.map(r => r.overallPurity);
    console.log(row('MEAN',    avg(pitch),  avg(time),  avg(ai),  avg(purity)));
    console.log(row('STD DEV', sdev(pitch), sdev(time), sdev(ai), sdev(purity)));
  }

  return results;
}

// ── separation analysis ───────────────────────────────────────────────────────

function printSeparation(aiR, humanR) {
  if (!aiR.length || !humanR.length) {
    console.log('\n(Add samples to both groups to see separation analysis.)');
    return;
  }

  const HR = '═'.repeat(82);
  console.log(`\n${HR}`);
  console.log('SEPARATION ANALYSIS');
  console.log('─'.repeat(82));

  const metrics = [
    { name: 'AI Generation',   aiVals: aiR.map(r => r.aiGeneration.score),    hVals: humanR.map(r => r.aiGeneration.score) },
    { name: 'Pitch Correction', aiVals: aiR.map(r => r.pitchCorrection.score), hVals: humanR.map(r => r.pitchCorrection.score) },
    { name: 'Time Alignment',   aiVals: aiR.map(r => r.timeAlignment.score),   hVals: humanR.map(r => r.timeAlignment.score) },
    { name: 'Overall Purity',   aiVals: aiR.map(r => r.overallPurity),         hVals: humanR.map(r => r.overallPurity), invert: true },
  ];

  for (const { name, aiVals, hVals, invert } of metrics) {
    const aiMean = avg(aiVals);
    const hMean  = avg(hVals);
    const gap    = Math.abs(aiMean - hMean);
    const mid    = (aiMean + hMean) / 2;
    const correct = invert ? aiMean < hMean : aiMean > hMean;
    const status  = correct ? '✓ correct direction' : '✗ INVERTED — check thresholds';
    const quality = gap > 30 ? 'good' : gap > 15 ? 'weak' : 'poor';
    console.log(
      `  ${name.padEnd(18)}  AI=${aiMean.toFixed(1).padStart(5)}  Human=${hMean.toFixed(1).padStart(5)}` +
      `  gap=${gap.toFixed(1).padStart(5)}  midpoint≈${Math.round(mid)}  [${quality}]  ${status}`
    );
  }

  // Per-file verdict at current threshold (overall purity < 50 → AI)
  console.log('\n  VERDICTS at current thresholds (grade D or F = flagged AI):');
  const falseNeg = aiR.filter(r => r.grade === 'A' || r.grade === 'B');
  const falsePos = humanR.filter(r => r.grade === 'D' || r.grade === 'F');
  console.log(`    False negatives (AI songs missed):    ${falseNeg.length}/${aiR.length}`);
  if (falseNeg.length) falseNeg.forEach(r => console.log(`      - ${r.name}  grade=${r.grade}  purity=${r.overallPurity}%`));
  console.log(`    False positives (human songs flagged): ${falsePos.length}/${humanR.length}`);
  if (falsePos.length) falsePos.forEach(r => console.log(`      - ${r.name}  grade=${r.grade}  purity=${r.overallPurity}%`));

  console.log(HR);
}

// ── main ──────────────────────────────────────────────────────────────────────

console.log(`\nHumanify Audio Purity — Detector Test Harness`);
console.log(`Endpoint : ${ENDPOINT}`);
console.log(`Samples  : ${SAMPLES}`);

const aiFiles    = getAudioFiles(join(SAMPLES, 'ai'));
const humanFiles = getAudioFiles(join(SAMPLES, 'human'));

const aiResults    = await runGroup('ai', aiFiles);
const humanResults = await runGroup('human', humanFiles);

printSeparation(aiResults, humanResults);
