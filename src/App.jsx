import { useState, useCallback, useEffect } from 'react';
import { QRTreeScene } from './components/QRTreeScene';
import { FlatCodeView } from './components/FlatCodeView';
import { generateQRMatrix } from './utils/qrMatrix';
import { generateDataMatrix } from './utils/dataMatrixGen';

const DEFAULT_TEXT = 'https://example.com';

export default function App() {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [committedText, setCommittedText] = useState(DEFAULT_TEXT);
  const [codeType, setCodeType] = useState('qr');
  const [preset, setPreset] = useState('isometric');
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sizeInfo, setSizeInfo] = useState('');

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
        const m = codeType === 'qr'
          ? await generateQRMatrix(committedText)
          : await generateDataMatrix(committedText);

        if (!m || m.length === 0) throw new Error('Generated matrix is empty');

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

  const handleGenerate = useCallback(() => setCommittedText(inputText.trim()), [inputText]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter') handleGenerate(); }, [handleGenerate]);

  const isFlatView = preset === 'front';

  return (
    <div className={`flex flex-col h-screen w-screen text-white overflow-hidden ${isFlatView ? 'bg-white' : 'bg-[#0f0f0f]'}`}>
      {/* ── Header ── */}
      <header className={`flex-shrink-0 px-4 py-3 flex flex-col gap-3 ${isFlatView ? 'bg-white border-b border-gray-200' : 'glass-panel'}`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-xl font-bold tracking-tight ${isFlatView ? 'text-gray-800' : 'title-glow'}`}>
            🌸 QR Tree Creator
          </h1>
          {sizeInfo && (
            <span className={`text-xs font-mono opacity-80 ${isFlatView ? 'text-gray-500' : 'text-pink-300'}`}>
              {sizeInfo}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter text or URL…"
            className={`flex-1 min-w-[160px] rounded-lg px-3 py-2 text-sm focus:outline-none transition-all
              ${isFlatView
                ? 'bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-400 focus:border-pink-400'
                : 'bg-[#1a1a1a] border border-white/10 text-white placeholder-white/30 focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/30'
              }`}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-glow bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>

          <div className={`flex rounded-lg overflow-hidden border ${isFlatView ? 'border-gray-300' : 'border-white/10'}`}>
            {['qr', 'datamatrix'].map((type) => (
              <button
                key={type}
                onClick={() => setCodeType(type)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  codeType === type
                    ? 'bg-pink-600 text-white'
                    : isFlatView
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {type === 'qr' ? 'QR Code' : 'Data Matrix'}
              </button>
            ))}
          </div>

          <div className={`w-px h-6 hidden sm:block ${isFlatView ? 'bg-gray-300' : 'bg-white/10'}`} />

          <div className="flex gap-1.5">
            {[
              { key: 'front', label: 'Top (Scan)' },
              { key: 'side', label: 'Side' },
              { key: 'isometric', label: 'Isometric' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  preset === key
                    ? isFlatView
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white/15 text-white border-pink-400/40 btn-glow'
                    : isFlatView
                      ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      : 'bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-white/5 border-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs fade-in">⚠ {error}</p>}
      </header>

      {/* ── Main view ── */}
      <div className="canvas-container flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f0f0f]/70 backdrop-blur-sm fade-in">
            <div className="spinner mb-4" />
            <p className="text-pink-300 text-sm">Building your blossom tree…</p>
          </div>
        )}

        {!loading && !matrix && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 select-none">
            <span className="text-6xl mb-4">🌸</span>
            <p className="text-sm">Enter text above and press Generate</p>
          </div>
        )}

        {!loading && !matrix && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400/70 select-none">
            <span className="text-6xl mb-4">⚠️</span>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {matrix && (
          isFlatView
            ? <FlatCodeView matrix={matrix} />
            : <QRTreeScene matrix={matrix} preset={preset} />
        )}
      </div>

      {/* ── Footer ── */}
      {!isFlatView && (
        <footer className="flex-shrink-0 px-6 py-2 flex items-center justify-center text-[10px] text-white/20 select-none">
          Drag to orbit · Scroll to zoom · Double-click to reset
        </footer>
      )}
    </div>
  );
}
