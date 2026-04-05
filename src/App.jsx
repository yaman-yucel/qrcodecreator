import { useState, useCallback, useEffect, useRef } from 'react';
import { QRTreeScene } from './components/QRTreeScene';
import { generateQRMatrix } from './utils/qrMatrix';
import { generateDataMatrix } from './utils/dataMatrixGen';
import QRCode from 'qrcode';

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
  const [showScanModal, setShowScanModal] = useState(false);
  const [flatQRUrl, setFlatQRUrl] = useState('');
  const canvasRef = useRef(null);

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
          // Also pre-generate flat scannable QR image
          const url = await QRCode.toDataURL(committedText, {
            errorCorrectionLevel: 'M',
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setFlatQRUrl(url);
        } else {
          m = await generateDataMatrix(committedText);
          setFlatQRUrl('');
        }

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

  const handleGenerate = useCallback(() => {
    setCommittedText(inputText.trim());
  }, [inputText]);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Enter') handleGenerate(); },
    [handleGenerate]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* ── Header ── */}
      <header className="glass-panel flex-shrink-0 px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight title-glow">🌸 QR Tree Creator</h1>
          <div className="flex items-center gap-3">
            {sizeInfo && (
              <span className="text-xs text-pink-300 font-mono opacity-80">{sizeInfo}</span>
            )}
            {/* Scan QR button — only for QR codes */}
            {matrix && codeType === 'qr' && flatQRUrl && (
              <button
                onClick={() => setShowScanModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                           bg-white text-black hover:bg-white/90 transition-colors shadow"
              >
                📷 Scan QR
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter text or URL…"
            className="flex-1 min-w-[160px] bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm
                       text-white placeholder-white/30 focus:outline-none focus:border-pink-400/50
                       focus:ring-1 focus:ring-pink-400/30 transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-glow bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>

          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {['qr', 'datamatrix'].map((type) => (
              <button
                key={type}
                onClick={() => setCodeType(type)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  codeType === type
                    ? 'bg-pink-600 text-white'
                    : 'bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {type === 'qr' ? 'QR Code' : 'Data Matrix'}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 hidden sm:block" />

          <div className="flex gap-1.5">
            {[
              { key: 'front', label: 'Top' },
              { key: 'side', label: 'Side' },
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

        {error && <p className="text-red-400 text-xs fade-in">⚠ {error}</p>}
      </header>

      {/* ── 3D Canvas ── */}
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
        {matrix && <QRTreeScene matrix={matrix} preset={preset} />}
      </div>

      {/* ── Footer ── */}
      <footer className="flex-shrink-0 px-6 py-2 flex items-center justify-center text-[10px] text-white/20 select-none">
        Drag to orbit · Scroll to zoom · Double-click to reset
      </footer>

      {/* ── Scan QR Modal ── */}
      {showScanModal && flatQRUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowScanModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-black font-semibold text-sm">Scan this QR code</p>
            <img
              src={flatQRUrl}
              alt="Scannable QR code"
              className="w-64 h-64 rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            <p className="text-gray-500 text-xs text-center max-w-[220px] break-all">
              {committedText}
            </p>
            <button
              onClick={() => setShowScanModal(false)}
              className="w-full py-2 rounded-xl bg-black text-white text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
