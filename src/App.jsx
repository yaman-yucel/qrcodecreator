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
    <div className="flex flex-col h-screen w-screen bg-white text-gray-800 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-4 py-3 flex flex-col gap-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">🌸 QR Tree Creator</h1>
          {sizeInfo && (
            <span className="text-xs font-mono text-pink-500">{sizeInfo}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter text or URL…"
            className="flex-1 min-w-[160px] rounded-lg px-3 py-2 text-sm bg-gray-100 border border-gray-300
                       text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>

          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            {['qr', 'datamatrix'].map((type) => (
              <button
                key={type}
                onClick={() => setCodeType(type)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  codeType === type
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type === 'qr' ? 'QR Code' : 'Data Matrix'}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200 hidden sm:block" />

          <div className="flex gap-1.5">
            {[
              { key: 'front', label: 'Top (Scan)' },
              { key: 'side',  label: 'Side' },
              { key: 'isometric', label: 'Isometric' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  preset === key
                    ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">⚠ {error}</p>}
      </header>

      {/* ── Main view ── */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="spinner mb-4" />
            <p className="text-pink-500 text-sm">Building your blossom tree…</p>
          </div>
        )}

        {!loading && !matrix && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 select-none">
            <span className="text-6xl mb-4">🌸</span>
            <p className="text-sm">Enter text above and press Generate</p>
          </div>
        )}

        {!loading && !matrix && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 select-none">
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
        <footer className="flex-shrink-0 px-6 py-2 flex items-center justify-center text-[10px] text-gray-400 select-none border-t border-gray-100">
          Drag to orbit · Scroll to zoom · Double-click to reset
        </footer>
      )}
    </div>
  );
}
