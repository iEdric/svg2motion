
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SvgConverter } from './services/converter';
import { ExportFormat } from './types.js';
import type { ConverterSettings, SvgAnalysis } from './types.js';

type Tab = 'code' | 'preview' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [svgCode, setSvgCode] = useState<string>(`<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="400" fill="#0f172a" rx="20" />
  <g transform="translate(200,200)">
    <!-- Rotating glow -->
    <circle r="100" fill="none" stroke="url(#gradient)" stroke-width="4" stroke-dasharray="10 20">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
    </circle>
    
    <!-- Central Pulsing Core -->
    <circle r="40" fill="#6366f1">
      <animate attributeName="r" values="40;50;40" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
    </circle>

    <!-- Satellite -->
    <circle r="10" fill="#f43f5e">
       <animateMotion dur="3s" repeatCount="indefinite" path="M 0,-80 A 80,80 0 1,1 0,80 A 80,80 0 1,1 0,-80" />
    </circle>
  </g>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f43f5e;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<SvgAnalysis | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<ConverterSettings>({
    fps: 30,
    duration: 4,
    scale: 2.0,
    quality: 1.0,
    format: ExportFormat.MP4,
    transparent: false
  });

  const converterRef = useRef<SvgConverter | null>(null);

  // Pre-process the SVG for preview to make it responsive regardless of fixed width/height
  const previewSvg = useMemo(() => {
    try {
      // We wrap the SVG to ensure it fills the container while keeping aspect ratio
      // This is purely for UI preview and doesn't affect the final export
      return svgCode.replace(/<svg([^>]*)>/i, (_, attrs) => {
        // Remove existing width/height if they exist to let CSS control it
        const cleanedAttrs = attrs.replace(/\b(width|height)\s*=\s*["'][^"']*["']/gi, '');
        return `<svg ${cleanedAttrs} width="100%" height="100%" style="max-width:100%; max-height:100%; display:block; margin:auto; transition: all 0.3s ease;">`;
      });
    } catch (e) {
      return svgCode;
    }
  }, [svgCode]);

  const updateLocalAnalysis = useCallback((code: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return;
      
      const newAnalysis: SvgAnalysis = {
        hasSmil: !!code.match(/<(animate|animateTransform|animateMotion|animateColor|set)/i),
        hasCssAnimation: code.includes('animation:') || code.includes('@keyframes'),
        viewBox: svg.getAttribute('viewBox'),
        width: parseFloat(svg.getAttribute('width') || svg.viewBox?.baseVal?.width?.toString() || '400'),
        height: parseFloat(svg.getAttribute('height') || svg.viewBox?.baseVal?.height?.toString() || '400'),
        suggestedDuration: 5
      };
      setAnalysis(newAnalysis);
    } catch (e) {
      console.warn("Analysis failed", e);
    }
  }, []);

  useEffect(() => {
    converterRef.current = new SvgConverter();
    updateLocalAnalysis(svgCode);
  }, [updateLocalAnalysis]);

  const handleSvgChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setSvgCode(code);
    setResultUrl(null);
    updateLocalAnalysis(code);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSvgCode(content);
        setResultUrl(null);
        updateLocalAnalysis(content);
        setActiveTab('preview');
      };
      reader.readAsText(file);
    }
  };

  const startConversion = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    
    try {
      if (!converterRef.current) throw new Error("Converter not ready");
      const blob = await converterRef.current.convert(svgCode, settings, (p) => setProgress(p));
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || "Failed to render animation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `vector-export-${Date.now()}.${settings.format.toLowerCase()}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      {/* Header */}
      <header className="sticky top-0 h-16 border-b border-slate-800 dark-glass px-4 lg:px-8 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 lg:p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <i className="fas fa-magic text-white text-sm lg:text-base"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base lg:text-lg font-bold tracking-tight text-white">VectorMotion <span className="text-indigo-400">Pro</span></h1>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest hidden lg:block">Stable SVG Exporter</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <label className="bg-slate-800 hover:bg-slate-700 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer border border-slate-700 flex items-center whitespace-nowrap">
            <i className="fas fa-file-import mr-2 opacity-50 hidden sm:inline"></i>
            Import
            <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={startConversion}
            disabled={isProcessing}
            className={`px-4 lg:px-6 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${isProcessing ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
          >
            {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-play text-[10px] lg:text-xs"></i>}
            <span>{isProcessing ? `${progress}%` : 'Export'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 min-h-0 relative flex-col lg:flex-row">
        
        {/* Mobile Tabs */}
        <div className="lg:hidden flex border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-2 py-1">
          <button
            onClick={() => setActiveTab('code')}
            className={`tab-button tab-${activeTab === 'code' ? 'active' : 'inactive'} flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2`}
          >
            <i className="fas fa-code text-sm"></i>
            <span className="hidden xs:inline">Code</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`tab-button tab-${activeTab === 'preview' ? 'active' : 'inactive'} flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2`}
          >
            <i className="fas fa-eye text-sm"></i>
            <span className="hidden xs:inline">Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`tab-button tab-${activeTab === 'settings' ? 'active' : 'inactive'} flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2`}
          >
            <i className="fas fa-cog text-sm"></i>
            <span className="hidden xs:inline">Config</span>
          </button>
        </div>

        {/* Editor Sidebar */}
        <div className={`${activeTab === 'code' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[400px] xl:w-[450px] border-r border-slate-800 flex-col dark-glass shrink-0 min-h-0 flex-1`}>
          <div className="hidden lg:flex px-6 py-4 border-b border-slate-800/60 items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                <i className="fas fa-code text-indigo-400 text-sm"></i>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-300">SVG Source</span>
                <p className="text-xs text-slate-500">Paste or edit your SVG code</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500/60"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/60"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/60"></div>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden min-h-0">
            <textarea
              value={svgCode}
              onChange={handleSvgChange}
              spellCheck={false}
              placeholder="Paste your SVG code here..."
              className="w-full h-full p-4 lg:p-6 font-mono text-sm bg-transparent text-slate-300 resize-none focus:outline-none leading-relaxed selection:bg-indigo-500/20 border-0"
              style={{ minHeight: '100%', boxSizing: 'border-box' }}
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-500 font-mono bg-slate-800/80 px-2 py-1 rounded z-10">
              Lines: {svgCode.split('\n').length}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 overflow-y-auto p-4 lg:p-8 items-center h-full`}>
          <div className="w-full max-w-5xl space-y-8 pb-12">
            {/* Adaptive Preview Card */}
            <div className="bg-slate-800/40 rounded-2xl lg:rounded-3xl border border-slate-700/50 p-4 lg:p-8 shadow-2xl relative overflow-hidden dark-glass">
               <div className="hidden sm:block absolute top-4 left-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded z-10">Preview Engine</div>
               
               {/* Container that adapts to SVG size while maintaining reasonable constraints */}
               <div className="w-full min-h-[320px] sm:min-h-[450px] lg:min-h-[550px] bg-slate-950 rounded-xl lg:rounded-2xl border border-slate-800/50 flex items-center justify-center overflow-hidden relative shadow-inner">
                  {/* Backdrop Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
                  
                  {/* The SVG itself, processed to be adaptive */}
                  <div 
                    className="w-full h-full flex items-center justify-center p-4 sm:p-8"
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />

                  {/* Canvas Info Overlay */}
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700/50 px-3 py-1.5 rounded-lg flex items-center space-x-3 pointer-events-none">
                     <span className="text-[10px] font-mono text-indigo-400 font-bold">
                        {analysis ? `${Math.round(analysis.width)}×${Math.round(analysis.height)}` : 'Auto'}
                     </span>
                     <div className="h-3 w-px bg-slate-700"></div>
                     <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Original</span>
                  </div>
               </div>
            </div>

            {/* Results */}
            {resultUrl && (
              <div className="bg-indigo-600 rounded-2xl lg:rounded-3xl p-5 lg:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 lg:gap-6 shadow-2xl shadow-indigo-500/20 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-4 lg:space-x-5 text-center sm:text-left">
                  <div className="hidden sm:flex w-12 lg:w-14 h-12 lg:h-14 bg-white/20 backdrop-blur rounded-xl lg:rounded-2xl items-center justify-center text-xl lg:text-2xl">
                    <i className="fas fa-check-double"></i>
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold leading-tight">Ready for Download</h3>
                    <p className="text-indigo-100/70 text-xs lg:text-sm">High-bitrate {settings.format} generated successfully.</p>
                  </div>
                </div>
                <button 
                  onClick={downloadResult}
                  className="w-full sm:w-auto bg-white text-indigo-600 px-6 lg:px-8 py-2.5 lg:py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-lg shadow-black/10"
                >
                  <i className="fas fa-download"></i>
                  <span>Save to Device</span>
                </button>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 lg:p-6 rounded-xl lg:rounded-2xl text-rose-400 flex items-center space-x-3 animate-in fade-in">
                <i className="fas fa-triangle-exclamation text-lg"></i>
                <p className="text-xs lg:text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="lg:hidden p-4 dark-glass rounded-xl border border-slate-700/30 text-center">
               <div className="flex items-center justify-center gap-2 mb-2">
                 <i className="fas fa-info-circle text-indigo-400 text-sm"></i>
                 <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Pro Tip</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                 Use desktop for the ultimate side-by-side editing experience with full workspace layout.
               </p>
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className={`${activeTab === 'settings' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 xl:w-88 border-l border-slate-800 dark-glass p-6 flex-col space-y-8 shrink-0 h-full overflow-y-auto`}>
          <section className="space-y-4">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                 <i className="fas fa-file-export text-indigo-400 text-sm"></i>
               </div>
               <div>
                 <h3 className="text-sm font-semibold text-slate-300">Export Format</h3>
                 <p className="text-xs text-slate-500">Choose your output format</p>
               </div>
             </div>
             <div className="grid grid-cols-3 gap-3">
                {[ExportFormat.MP4, ExportFormat.GIF, ExportFormat.WEBM].map(f => (
                  <button
                    key={f}
                    onClick={() => setSettings({...settings, format: f})}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                      settings.format === f
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                <i className="fas fa-sliders-h text-indigo-400 text-sm"></i>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Configuration</h3>
                <p className="text-xs text-slate-500">Fine-tune your export settings</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">Frame Rate</label>
                  <span className="text-sm font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded">{settings.fps} FPS</span>
                </div>
                <input
                  type="range" min="12" max="60" step="4"
                  value={settings.fps}
                  onChange={(e) => setSettings({...settings, fps: parseInt(e.target.value)})}
                  className="w-full h-2 slider"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>12</span>
                  <span>60</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">Duration</label>
                  <span className="text-sm font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded">{settings.duration}s</span>
                </div>
                <input
                  type="range" min="0.5" max="15" step="0.5"
                  value={settings.duration}
                  onChange={(e) => setSettings({...settings, duration: parseFloat(e.target.value)})}
                  className="w-full h-2 slider"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0.5s</span>
                  <span>15s</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">Export Scale</label>
                  <span className="text-sm font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded">{settings.scale}x</span>
                </div>
                <input
                  type="range" min="0.5" max="4" step="0.5"
                  value={settings.scale}
                  onChange={(e) => setSettings({...settings, scale: parseFloat(e.target.value)})}
                  className="w-full h-2 slider"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0.5x</span>
                  <span>4x</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700/50 space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-300">Transparent Background</span>
                      <p className="text-xs text-slate-500">Remove background for alpha channel</p>
                    </div>
                    <button
                      onClick={() => setSettings({...settings, transparent: !settings.transparent})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                        settings.transparent ? 'bg-indigo-600' : 'bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                        settings.transparent ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                 </div>
              </div>
            </div>
          </section>

          <div className="hidden lg:block flex-1"></div>

          <div className="p-4 dark-glass rounded-2xl border border-indigo-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fas fa-shield-check text-indigo-400 text-sm"></i>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-indigo-300 mb-1">Smart Rendering</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our adaptive renderer automatically handles custom aspect ratios and complex SMIL/CSS animations.
                  Optimized for performance and quality across all export formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom padding */}
      <div className="lg:hidden h-2 bg-slate-900"></div>
    </div>
  );
};

export default App;
