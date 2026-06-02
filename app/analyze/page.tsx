"use client";

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import GradeCircle from '@/components/analyze/GradeCircle';
import AnalysisMeter from '@/components/analyze/AnalysisMeter';
import WaveformCanvas from '@/components/analyze/WaveformCanvas';
import TimestampPanel from '@/components/analyze/TimestampPanel';

type Timestamp = { timeStart: number; timeEnd: number; severity: 'low' | 'medium' | 'high'; detail: string };
type MetricResult = { score: number; label: string; timestamps: Timestamp[] };
type Region = { start: number; end: number; color: string };

type AnalysisResult = {
  duration: number;
  fileName: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  overallPurity: number;
  pitchCorrection: MetricResult;
  timeAlignment: MetricResult;
  aiGeneration: MetricResult;
  waveformData: number[];
  regions: Region[];
};

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type DecisionState = 'none' | 'approved' | 'rejected';

export default function AnalyzePage() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [decision, setDecision] = useState<DecisionState>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(mp3|wav)$/i)) {
      setError('Please upload an MP3 or WAV file.');
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setDecision('none');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);
    setProgress(0);
    setDecision('none');

    // Fake progress while waiting for server
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 4, 88));
    }, 400);

    try {
      const form = new FormData();
      form.append('audio', selectedFile);

      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      const data = await res.json();

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setResult(data);
      setAnimKey(k => k + 1);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
      setProgress(0);
    }
  };

  const handleDecision = (d: 'approved' | 'rejected') => {
    setDecision(d);
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-[#121212]/90 backdrop-blur-md border-b border-white/5">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#1DB954]/40 group-hover:ring-[#1DB954] transition-all duration-300">
            <Image src="/logo.jpg" alt="Humanify" fill className="object-cover" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Humanify</span>
        </a>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse inline-block" />
          Audio Purity Analyzer
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-[#1DB954] font-semibold tracking-widest uppercase text-xs">Humanify Platform Tools</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Audio Purity Analyzer</h1>
          <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
            Upload an MP3 or WAV file to detect pitch correction, time alignment editing, and AI generation
            characteristics using real spectral analysis.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-10 text-center ${
            dragOver
              ? 'border-[#1DB954] bg-[#1DB954]/5'
              : selectedFile
              ? 'border-[#1DB954]/50 bg-[#1DB954]/[0.03]'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {selectedFile ? (
            <div className="space-y-2">
              <div className="text-3xl">🎵</div>
              <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
              <p className="text-white/40 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
              <p className="text-white/30 text-xs">Click to change file</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl opacity-40">🎼</div>
              <div>
                <p className="text-white font-semibold">Drop your audio file here</p>
                <p className="text-white/40 text-sm mt-1">or click to browse — MP3 or WAV, up to 100 MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Analyze button + progress */}
        {selectedFile && (
          <div className="space-y-3">
            {analyzing && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-white/40">
                  <span>Analyzing audio…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1DB954] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/30 text-xs text-center">
                  Running FFT analysis, onset detection, and spectral feature extraction…
                </p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                analyzing
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-[#1DB954] hover:bg-[#1ed760] text-black hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {analyzing ? 'Analyzing…' : 'Analyze Audio'}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="space-y-5 pt-2">
            {/* File info bar */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/50">
              <span className="font-medium text-white/70">{result.fileName}</span>
              <span>Duration: {formatDuration(result.duration)}</span>
            </div>

            {/* Grade + Meters */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-center">
              {/* Grade circle */}
              <div className="flex justify-center">
                <GradeCircle grade={result.grade} purity={result.overallPurity} animationKey={animKey} />
              </div>

              {/* Analysis meters */}
              <div className="space-y-3">
                <AnalysisMeter
                  label="Pitch Correction Detection"
                  sublabel={result.pitchCorrection.label}
                  score={result.pitchCorrection.score}
                  icon="🎵"
                  animationKey={animKey}
                />
                <AnalysisMeter
                  label="Time Alignment Analysis"
                  sublabel={result.timeAlignment.label}
                  score={result.timeAlignment.score}
                  icon="⏱"
                  animationKey={animKey}
                />
                <AnalysisMeter
                  label="AI Generation Probability"
                  sublabel={result.aiGeneration.label}
                  score={result.aiGeneration.score}
                  icon="🤖"
                  animationKey={animKey}
                />
              </div>
            </div>

            {/* Waveform */}
            <WaveformCanvas
              waveformData={result.waveformData}
              regions={result.regions}
              duration={result.duration}
              animationKey={animKey}
            />

            {/* Timestamp breakdown */}
            <TimestampPanel
              pitchTimestamps={result.pitchCorrection.timestamps}
              timeTimestamps={result.timeAlignment.timestamps}
              aiTimestamps={result.aiGeneration.timestamps}
            />

            {/* Methodology note */}
            <div className="rounded-xl px-4 py-3 bg-white/[0.02] border border-white/[0.04] text-white/30 text-xs leading-relaxed">
              <span className="font-semibold text-white/40">Methodology: </span>
              Pitch correction inferred from chroma entropy and spectral centroid variance. Time alignment from
              onset-detected IOI coefficient of variation. AI characteristics from spectral flatness uniformity,
              MFCC frame-to-frame delta, and dynamic range. Scores are probabilistic indicators, not definitive proof.
            </div>

            {/* Approve / Reject */}
            {decision === 'none' ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-white font-semibold">Platform Review Decision</p>
                  <p className="text-white/40 text-sm">
                    Based on the analysis above (Grade {result.grade}, {result.overallPurity}% purity), decide whether
                    this track meets Humanify&#39;s authenticity standards.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDecision('approved')}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] border border-[#1DB954]/30 hover:border-[#1DB954]/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-lg">✅</span>
                    Approve for Platform
                  </button>
                  <button
                    onClick={() => handleDecision('rejected')}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 hover:border-red-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-lg">❌</span>
                    Reject Track
                  </button>
                </div>
              </div>
            ) : decision === 'approved' ? (
              <div className="rounded-2xl border border-[#1DB954]/40 bg-[#1DB954]/[0.07] p-6 text-center space-y-2">
                <div className="text-3xl">✅</div>
                <p className="text-[#1DB954] font-bold text-lg">Approved for Platform</p>
                <p className="text-[#1DB954]/60 text-sm">
                  Track meets Humanify&#39;s authenticity standards. Grade {result.grade} — {result.overallPurity}% purity.
                </p>
                <button
                  onClick={() => setDecision('none')}
                  className="mt-2 text-xs text-white/30 hover:text-white/50 underline transition-colors"
                >
                  Undo decision
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/[0.07] p-6 text-center space-y-2">
                <div className="text-3xl">❌</div>
                <p className="text-red-400 font-bold text-lg">Track Rejected</p>
                <p className="text-red-400/60 text-sm">
                  Track does not meet Humanify&#39;s authenticity standards. Grade {result.grade} — flagged for review.
                </p>
                <button
                  onClick={() => setDecision('none')}
                  className="mt-2 text-xs text-white/30 hover:text-white/50 underline transition-colors"
                >
                  Undo decision
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
