import { useState, useCallback, useEffect } from 'react';
import { QRTreeScene } from './components/QRTreeScene';
import { generateQRMatrix } from './utils/qrMatrix';
import { generateDataMatrix } from './utils/dataMatrixGen';

const DEFAULT_TEXT = 'https://example.com';

export default function App() {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [committedText, setCommittedText] = useState(DEFAULT_TEXT);
  const [codeType, setCodeType] = useState('qr'); // 'qr' | 'datamatrix'
  const [preset, setPreset] = useState('isometric');
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sizeInfo, setSizeInfo] = useState('');

  // Generate matrix whenever committedText or codeType changes
  useEffect(() => {
    if (!committedText.trim()) {
      setError('Please enter some text or a URL.');
      setMatrix(null);
      setSizeInfo('');
      return;
    }

    setLoading(true);
    setError('');

    const run = async () => {
      try {
        let m;
        if (codeType === 'qr') {
          m = await generateQRMatrix(committedText);
        } else {
          m = await generateDataMatrix(committedText);
        }

        if (!m || m.length === 0) {
          throw new Error('Generated matrix is empty');
        }

        setMatrix(m);
        setSizeInfo(`${m.length}×${m[0]?.length ?? m.length} modules`);
      } catch (err) {
        console.error(err);
        setError(`Failed to generate code: ${err.message}`);
        setMatrix(null);
        setSizeInfo('');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [committedText, codeType]);

  const handleGenerate = useCallback(() => {
    setCommittedText(inputText.trim());
  }, [inputText]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') handleGenerate();
    },
    [handleGenerate]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* ── Header ── */}
      <header className="glass-panel flex-shrink-0 px-6 py-4 flex flex-col gap-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight title-glow">
            🌸 QR Tree Creator
          </h1>
          {sizeInfo && (
            <span className="text-xs text-pink-300 font-mono opacity-80 fade-in">
              {sizeInfo}
            </span>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter text or URL…"
            className="flex-1 min-w-[200px] bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm
                       text-white placeholder-white/30 focus:outline-none focus:border-pink-400/50
                       focus:ring-1 focus:ring-pink-400/30 transition-all"
          />

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-glow bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>

          {/* Code type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {['qr', 'datamatrix'].map((type) => (
              <button
                key={type}
                onClick={() => setCodeType(type)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  codeType === type
                    ? 'bg-pink-600 text-white'
                    : 'bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {type === 'qr' ? 'QR Code' : 'Data Matrix'}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 hidden sm:block" />

          {/* View preset buttons */}
          <div className="flex gap-2">
            {[
              { key: 'front', label: 'Top (QR View)' },
              { key: 'side', label: 'Side (Tree View)' },
              { key: 'isometric', label: 'Isometric' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  preset === key
                    ? 'bg-white/15 text-white border border-pink-400/40 btn-glow'
                    : 'bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-xs mt-1 fade-in">⚠ {error}</p>
        )}
      </header>

      {/* ── 3D Canvas ── */}
      <div className="canvas-container flex-1 relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f0f0f]/70 backdrop-blur-sm fade-in">
            <div className="spinner mb-4" />
            <p className="text-pink-300 text-sm">Building your blossom tree…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !matrix && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 select-none">
            <span className="text-6xl mb-4">🌸</span>
            <p className="text-sm">Enter text above and press Generate</p>
          </div>
        )}

        {/* Error state (no matrix) */}
        {!loading && !matrix && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400/70 select-none">
            <span className="text-6xl mb-4">⚠️</span>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Three.js scene */}
        {matrix && (
          <QRTreeScene matrix={matrix} preset={preset} />
        )}
      </div>

      {/* ── Footer hint ── */}
      <footer className="flex-shrink-0 px-6 py-2 flex items-center justify-center text-[10px] text-white/20 select-none">
        Drag to orbit · Scroll to zoom · Double-click to reset
      </footer>
    </div>
  );
}
