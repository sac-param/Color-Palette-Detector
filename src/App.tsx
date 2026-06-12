import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  Copy,
  AlertTriangle,
  Lightbulb,
  Brush,
  History,
  RotateCcw,
} from "lucide-react";
import ImageColorPicker from "./components/ImageColorPicker";
import ColorSwatches from "./components/ColorSwatches";
import ColorSchemesList from "./components/ColorSchemesList";
import { ColorDetectionResult } from "./types";

const SAMPLE_PRESETS = [
  {
    name: "Toy Blocks Layer",
    description: "Vibrant color squares on white canvas",
    url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Lush Tropical Greens",
    description: "Forest foliage, teals, and light moss",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Golden Sunset Coast",
    description: "Deep oceanic blue and solar golden sands",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  },
];

const LOADING_STEPS = [
  "Reading image pixel formats...",
  "Running spatial quantization algorithms...",
  "Triggering multimodal analysis via Gemini-3.5-Flash...",
  "Awaiting dominant color boundaries...",
  "Extracting hex codes & RGB components...",
  "Calculating pigment percentage distribution...",
  "Formulating matching complementary palettes...",
  "Drafting mood atmosphere report...",
  "Finalizing color scheme variables...",
];

export default function App() {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_PRESETS[0].url);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [result, setResult] = useState<ColorDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ thumbnail: string; result: ColorDetectionResult }>>([]);

  // Loop through funny loading steps during execution
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageSrc(reader.result);
          setResult(null); // Clear previous results to prompt new run
        }
      };
      reader.onerror = () => {
        setError("Failed to read dropped image file.");
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please drop a valid image file (PNG, JPG, WebP, etc.).");
    }
  };

  // Handle file picker selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageSrc(reader.result);
          setResult(null); // Clear previous results
        }
      };
      reader.onerror = () => {
        setError("Failed to read selected file.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Select Preset Trigger
  const selectPreset = (url: string) => {
    setImageSrc(url);
    setResult(null);
    setError(null);
  };

  // Run backend logic
  const analyzePalette = async () => {
    if (!imageSrc) {
      setError("Please select or upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/detect-colors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageSrc }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}. Failed to communicate with server.`
        );
      }

      const data: ColorDetectionResult = await response.json();
      setResult(data);

      // Add to session history
      setHistory((prev) => {
        // Prevent duplicate entries of the same general aesthetic
        if (prev.some((h) => h.result.dominantColors[0]?.hex === data.dominantColors[0]?.hex)) return prev;
        return [{ thumbnail: imageSrc, result: data }, ...prev].slice(0, 5);
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during color analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Export current palette as CSS variables
  const [isCopiedAsCss, setIsCopiedAsCss] = useState(false);
  const handleExportCSS = () => {
    if (!result) return;
    const variables = result.dominantColors
      .map((color, index) => {
        const cleanName = color.name.toLowerCase().replace(/\s+/g, "-");
        return `  --clr-${cleanName}: ${color.hex}; /* ${color.percentage}% share */`;
      })
      .join("\n");

    const cssString = `:root {\n${variables}\n}`;
    navigator.clipboard.writeText(cssString);
    setIsCopiedAsCss(true);
    setTimeout(() => setIsCopiedAsCss(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 flex flex-col font-sans" id="app-viewport">
      {/* Decorative Top Accent Bar */}
      <div className="h-1 bg-black" />

      {/* Main navigation header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-950 tracking-wider font-mono flex items-center gap-2">
                CHROMA_API_v1
              </h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                Dominant Color Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>SYSTEMS_LIVE</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hidden md:inline">
              v1.4.0
            </span>
          </div>
        </div>
      </header>

      {/* Core Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Control Platform (5 Cols) */}
          <section className="lg:col-span-12 xl:col-span-5 space-y-6" id="left-platform">
            {/* Image Selection Block */}
            <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Image Target</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Upload layout tiles, natural scenery, patterns, or graphic designs.
                </p>
              </div>

              {/* Drag and Drop Region */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                  isDragOver
                    ? "border-black bg-zinc-50 scale-[1.01]"
                    : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50"
                }`}
              >
                <input
                  type="file"
                  id="image-file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {/* Overlay Picker Trigger */}
                <label
                  htmlFor="image-file-upload"
                  className="flex flex-col items-center justify-center p-6 text-center cursor-pointer space-y-2.5"
                >
                  <div className="p-3 bg-white rounded border border-zinc-200 shadow-xs text-zinc-400 group-hover:text-black transition-colors">
                    <Upload className="w-5 h-5 mx-auto text-zinc-800" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block hover:underline">
                      Click to choose image file
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-1">
                      or drag & drop here (WBP, PNG, JPG, JPEG)
                    </span>
                  </div>
                </label>
              </div>

              {/* Preset Carousel */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-405 uppercase tracking-widest block">
                  Quick Testing Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_PRESETS.map((preset, idx) => {
                    const isSelected = imageSrc === preset.url;
                    return (
                      <button
                        key={`preset-${idx}`}
                        onClick={() => selectPreset(preset.url)}
                        className={`group relative text-left rounded overflow-hidden border p-1 transition-all text-xs flex flex-col justify-end min-h-[56px] focus:outline-none ${
                          isSelected
                            ? "border-zinc-900 ring-2 ring-zinc-200 bg-zinc-100"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent" />
                        <span className="relative z-10 text-[9px] font-bold text-white uppercase tracking-wider leading-tight line-clamp-1">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Command Action Button */}
              <button
                onClick={analyzePalette}
                disabled={loading || !imageSrc}
                className="w-full bg-black hover:bg-zinc-800 text-white font-bold rounded-xl py-3.5 px-4 text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-zinc-350 animate-pulse" />
                <span>{loading ? "Analyzing Color Footprints..." : "Extract Dominant Color Palette"}</span>
              </button>
            </div>

            {/* Live Interactive Pixel Inspector Box */}
            {imageSrc && (
              <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pixel Color Loupe</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Point your cursor anywhere on the picture to isolate and pin specific pixel-perfect Hex values.
                  </p>
                </div>

                <ImageColorPicker imageSrc={imageSrc} />
              </div>
            )}
          </section>

          {/* RIGHT COLUMN: Output Dashboard (7 Cols) */}
          <section className="lg:col-span-12 xl:col-span-7" id="right-dashboard">
            <AnimatePresence mode="wait">
              {/* If Loading state */}
              {loading && (
                <motion.div
                  key="loading-state"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border-2 border-zinc-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[480px] text-center space-y-6"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Ring loader */}
                    <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
                    <Palette className="w-6 h-6 text-zinc-900 absolute animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider animate-pulse">Running Color Analysis</h4>
                    <p className="text-xs text-zinc-400 font-mono tracking-wide max-w-sm mx-auto min-h-[1.5rem]">
                      {LOADING_STEPS[loadingStepIdx]}
                    </p>
                  </div>

                  {/* Modern skeleton simulator */}
                  <div className="w-full max-w-md space-y-3.5 pt-4">
                    <div className="h-3 bg-zinc-150 rounded w-2/3 mx-auto animate-pulse" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 bg-zinc-50 border border-zinc-200 rounded animate-pulse" />
                      <div className="h-20 bg-zinc-50 border border-zinc-200 rounded animate-pulse" />
                    </div>
                    <div className="h-24 bg-zinc-50 border border-zinc-200 rounded animate-pulse" />
                  </div>
                </motion.div>
              )}

              {/* If Error state */}
              {error && !loading && (
                <motion.div
                  key="error-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-50 rounded-2xl border-2 border-zinc-350 p-6 shadow-xs space-y-4 text-left"
                >
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-zinc-100 rounded text-zinc-900 border border-zinc-300 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Color Extraction Error</h4>
                      <p className="text-xs text-zinc-700 leading-relaxed">{error}</p>
                    </div>
                  </div>

                  {error.includes("GEMINI_API_KEY") && (
                    <div className="bg-white rounded p-4 border border-zinc-200 text-xs text-zinc-650 space-y-2 leading-relaxed">
                      <p className="font-bold flex items-center gap-1.5 text-zinc-800 uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-zinc-900" /> Key Setup Instructions:
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 font-sans">
                        <li>Locate the <strong>Settings</strong> button at the top-right of your screen.</li>
                        <li>Click <strong>Secrets</strong> inside the Settings menu.</li>
                        <li>Add a secret named <code>GEMINI_API_KEY</code> with your free Gemini API key.</li>
                        <li>Click save and retry analysis!</li>
                      </ol>
                    </div>
                  )}

                  <button
                    onClick={analyzePalette}
                    className="text-xs bg-black hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Retry Analysis
                  </button>
                </motion.div>
              )}

              {/* Empty state when no analysis is run yet */}
              {!loading && !result && !error && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border-2 border-zinc-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[440px] text-center space-y-5"
                >
                  <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-center shadow-sm">
                    <div className="w-6 h-6 border-2 border-zinc-400 rotate-45 animated-pulse"></div>
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-xs font-bold text-zinc-855 uppercase tracking-widest">Awaiting API Execution</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Trigger the analyzer endpoint below to extract the dominant hex footprints, complementary formulas, and metadata summaries of this image.
                    </p>
                  </div>
                  <button
                    onClick={analyzePalette}
                    className="bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-5 rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer mt-2 uppercase tracking-widest"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Scan Preset Target</span>
                  </button>
                </motion.div>
              )}

              {/* Color Analysis Results Platform */}
              {!loading && result && !error && (
                <motion.div
                  key="result-state"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Results Panel Header Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-505 uppercase tracking-widest">
                      <span className="bg-black text-white p-1.5 rounded">
                        <Palette className="w-3.5 h-3.5" />
                      </span>
                      <span>EXTRACTION_COMPLETE</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCSS}
                        className="text-xs font-bold text-white bg-black hover:bg-zinc-900 px-4 py-2 rounded transition-all flex items-center gap-2 cursor-pointer shadow-sm tracking-wider uppercase"
                      >
                        {isCopiedAsCss ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Variables Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Export CSS Variables</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Dominant Colors Section */}
                  <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 shadow-xs">
                    <ColorSwatches colors={result.dominantColors} />
                  </div>

                  {/* Secondary Color Schemes tracks */}
                  <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 shadow-xs">
                    <ColorSchemesList schemes={result.colorSchemes} />
                  </div>

                  {/* Poetic commentary & Branding suggestions - Structured Bento style */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* JSON Response Snippet */}
                    <div className="bg-zinc-900 rounded-2xl p-6 font-mono text-[10.5px] text-zinc-300 leading-relaxed overflow-hidden border border-zinc-950 shadow-md">
                      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider">RESPONSE_BODY (application/json)</span>
                        <span className="text-emerald-400 font-bold">200 OK</span>
                      </div>
                      <div className="space-y-1 select-all">
                        <div>{`{`}</div>
                        <div className="pl-4"><span className="text-zinc-500">"status":</span> <span className="text-emerald-400">"success"</span>,</div>
                        <div className="pl-4"><span className="text-zinc-500">"elements_count":</span> <span className="text-emerald-400">{result.dominantColors.length}</span>,</div>
                        <div className="pl-4"><span className="text-zinc-500">"atmosphere":</span> <span className="text-amber-400">"{result.moodDescription.slice(0, 50).replace(/"/g, '')}..."</span>,</div>
                        <div className="pl-4"><span className="text-zinc-500">"palette": [</span></div>
                        {result.dominantColors.slice(0, 3).map((col, cIdx) => (
                          <div key={cIdx} className="pl-8">
                            {`{ `}<span className="text-zinc-500">"hex":</span> <span className="text-indigo-300">"{col.hex}"</span>, <span className="text-zinc-500">"weight":</span> <span className="text-amber-300">{col.percentage}%</span> {` },`}
                          </div>
                        ))}
                        <div className="pl-4">]</div>
                        <div>{`}`}</div>
                      </div>
                    </div>

                    {/* Theme Suggestions & compute grids */}
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
                        <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-zinc-500" />
                          Theme Suggestions
                        </h4>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {result.themeSuggestions}
                        </p>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white border border-zinc-200 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-zinc-400 mb-1">ANALYSIS INSTABILITY</p>
                            <p className="text-base font-bold text-zinc-900">0% COLLISION</p>
                        </div>
                        <div className="flex-1 bg-white border border-zinc-200 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-zinc-400 mb-1">MODEL COGNITION</p>
                            <p className="text-base font-bold text-zinc-900">GEMINI FLASH</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Poetic commentary under-panel bar */}
                  <div className="bg-zinc-900 rounded-2xl p-5 text-white shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-white/10 rounded text-zinc-300">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                        Aesthetic Commentary
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {result.moodDescription}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Session History bar */}
            {history.length > 0 && !loading && (
              <div className="bg-white rounded-2xl border-2 border-zinc-200 p-5 shadow-xs space-y-3 mt-6">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent extractions
                </h4>

                <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                  {history.map((hist, hIdx) => {
                    return (
                      <button
                        key={`hist-${hIdx}`}
                        onClick={() => {
                          setResult(hist.result);
                          setImageSrc(hist.thumbnail);
                        }}
                        className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 p-2 rounded border border-zinc-200 text-left cursor-pointer shrink-0 transition-colors"
                      >
                        <img
                          src={hist.thumbnail}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded object-cover border border-zinc-300/50"
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider line-clamp-1 max-w-[120px]">
                            {hist.result.dominantColors[0]?.name || "Extract"}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold">
                            {hist.result.dominantColors[0]?.hex}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Decorative footer */}
      <footer className="border-t border-zinc-200 bg-zinc-100 py-6 mt-16 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold uppercase tracking-wider text-[10px]">
            STATUS: ALL SYSTEMS OPERATIONAL • API_v1
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded border border-zinc-200 text-zinc-800">
            POWERED BY models/gemini-3.5-flash
          </p>
        </div>
      </footer>
    </div>
  );
}
