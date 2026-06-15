import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertTriangle,
  RotateCcw,
  Camera,
  Trash2,
  Sliders,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Maximize2
} from "lucide-react";
import { DetectedBlock } from "./types";

interface CustomDie {
  id: number;
  imageUrl: string;
  name: string;
  uploadedAt: string;
}

const CONSTANT_DICE_IDS = Array.from({ length: 15 }, (_, i) => i + 1);

export default function App() {
  // 15 slots in the Constant Dice Rack
  const [rack, setRack] = useState<Record<number, CustomDie>>(() => {
    const saved = localStorage.getItem("rack_dice_custom");
    if (saved) {
      try { return JSON.parse(saved) as Record<number, CustomDie>; } catch (e) { /* ignore */ }
    }
    return {} as Record<number, CustomDie>;
  });

  // Target slot to upload customized die image for
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);

  // Main board/puzzle image
  const [puzzleImage, setPuzzleImage] = useState<string | null>(null);
  const [isDragOverPuzzle, setIsDragOverPuzzle] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scanned visual compared results from endpoint
  const [comparisonMatches, setComparisonMatches] = useState<Array<{
    dieId: number;
    exists: boolean;
    confidence: number;
    reason: string;
  }> | null>(null);
  const [analysisText, setAnalysisText] = useState<string>("");

  // Save rack whenever it changes
  useEffect(() => {
    localStorage.setItem("rack_dice_custom", JSON.stringify(rack));
  }, [rack]);

  // Handle customizable single die photo uploads
  const handleDiePhotoUpload = async (dieId: number, base64: string) => {
    setRack((prev) => ({
      ...prev,
      [dieId]: {
        id: dieId,
        imageUrl: base64,
        name: `Specimen #${dieId}`,
        uploadedAt: new Date().toLocaleTimeString(),
      },
    }));
    setActiveSlotId(null);
  };

  // Remove uploaded die photograph
  const removeDiePhoto = (dieId: number) => {
    setRack((prev) => {
      const updated = { ...prev };
      delete updated[dieId];
      return updated;
    });
  };

  // Puzzle upload drop triggers
  const handlePuzzleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPuzzle(true);
  };

  const handlePuzzleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPuzzle(false);
    setError(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPuzzleImage(reader.result);
          setComparisonMatches(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePuzzleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPuzzleImage(reader.result);
          setComparisonMatches(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run full-stack Gemini analysis to find blocks
  const analyzePuzzle = async () => {
    if (!puzzleImage) return;
    setIsAnalyzing(true);
    setError(null);
    setComparisonMatches(null);

    try {
      const rackDicePayload = (Object.values(rack) as CustomDie[]).map(die => ({
        id: die.id,
        imageUrl: die.imageUrl
      }));

      const resp = await fetch("/api/detect-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: puzzleImage,
          rackDice: rackDicePayload
        }),
      });

      if (!resp.ok) {
        throw new Error(`Execution error (Status ${resp.status})`);
      }

      const parsed = await resp.json();
      if (parsed.matches) {
        setComparisonMatches(parsed.matches);
      } else {
        setComparisonMatches([]);
      }
      setAnalysisText(parsed.moodDescription || "No comments returned from scanner.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process visual content via Gemini.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const matchedDiceCount = comparisonMatches ? comparisonMatches.filter((m: any) => m.exists).length : 0;
  const totalRegisteredCount = Object.keys(rack).length;

  // Render a clean structural layout
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 flex flex-col font-sans relative antialiasedSelection" id="app-root">
      {/* Visual Top Decorative Trim */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-zinc-900 to-cyan-600" />

      {/* Main Nav Header */}
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black font-display text-zinc-900 tracking-wider uppercase flex items-center gap-2">
                 BLUE_GREEN_EXHIBIT_SCANNER
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono font-bold leading-none uppercase tracking-widest mt-0.5">
                Physical Dice Match verify.conops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[10px] items-center gap-1.5 font-bold font-mono tracking-wider uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/55 px-3 py-1.5 rounded-lg flex shadow-xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>STABILITY_VERIFIED</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Resave layout registry and wipe all uploaded slots?")) {
                  setRack({});
                  setPuzzleImage(null);
                  setComparisonMatches(null);
                  localStorage.removeItem("rack_dice_custom");
                }
              }}
              title="Reset configuration"
              className="p-2 text-zinc-400 hover:text-red-650 hover:bg-zinc-100 rounded-lg transition-all border border-transparent hover:border-zinc-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Core Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
        
        {/* UPPER RACK SECTION: Unplaced 15 Constant Dice Rack */}
        <section className="bg-white rounded-3xl border-2 border-zinc-200/90 p-6 md:p-8 shadow-sm space-y-6" id="dice-rack-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-150 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-black font-mono tracking-widest text-zinc-800 uppercase">
                  Unplaced 15 Constant Dice Rack
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
                Define your physical dice specifications. Click any empty slot to upload a close-up photo of a physical die, then upload your main board puzzle snapshot below to find if each uploaded die exists in the puzzle image.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-zinc-500 bg-zinc-100 border border-zinc-200/80 px-3 py-1.5 rounded-lg shrink-0 self-start md:self-auto">
              REGISTERED SPECIES: <span className="text-zinc-900">{totalRegisteredCount}</span> / 15
            </div>
          </div>

          {/* 15 grid slots layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-15 gap-3.5 pt-2">
            {CONSTANT_DICE_IDS.map((idx) => {
              const item = rack[idx];
              return (
                <div
                  key={`slot-${idx}`}
                  className="aspect-square relative flex flex-col group rounded-2xl overflow-hidden shadow-xs"
                >
                  {item ? (
                    // Populated state - Clickable to update die photo
                    <div 
                      onClick={() => setActiveSlotId(idx)}
                      className="w-full h-full relative group cursor-pointer hover:scale-[1.01] transition-transform"
                    >
                      <img
                        src={item.imageUrl}
                        alt={`Die #${idx}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-xs p-1.5 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-white">Specimen #{idx}</span>
                      </div>
                      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDiePhoto(idx);
                          }}
                          title="Wipe die custom metrics"
                          className="p-1 text-white bg-red-650 hover:bg-red-770 rounded shadow-md cursor-pointer transition-transform duration-100 hover:scale-105"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Empty clickable state
                    <button
                      onClick={() => setActiveSlotId(idx)}
                      className="w-full h-full border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50 flex flex-col items-center justify-center p-2 text-center transition-all duration-150 hover:scale-[1.02] cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-full bg-zinc-205 flex items-center justify-center text-zinc-500 text-[10px] font-black group-hover:bg-zinc-800 group-hover:text-white transition-colors duration-155">
                        {idx}
                      </span>
                      <Camera className="w-4 h-4 text-zinc-400 mt-2 group-hover:text-zinc-600 transition-colors" />
                      <span className="text-[8px] font-black font-mono tracking-tighter text-zinc-450 uppercase mt-1">
                        Upload
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* WORKSPACE COMBINED GRID BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: BOARD PUZZLE IMAGE UPLOADER */}
          <section className="lg:col-span-6 bg-white rounded-3xl border-2 border-zinc-200/90 p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                Capture Frame Integration
              </h3>
              <h2 className="text-[17px] font-bold text-zinc-900 mt-1 font-display leading-tight">
                Upload Full Puzzle Photo
              </h2>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Provide a photo showing the arrangement of colored blocks (green/blue groups). We will locate the blocks and match them back to your rack.
              </p>
            </div>

            {/* Drag & Drop space */}
            <div
              onDragOver={handlePuzzleDragOver}
              onDragLeave={() => setIsDragOverPuzzle(false)}
              onDrop={handlePuzzleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[250px] ${
                isDragOverPuzzle
                  ? "border-emerald-600 bg-emerald-50/30 scale-[1.01]"
                  : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/40"
              }`}
            >
              {puzzleImage ? (
                <div className="w-full space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-black/5 mx-auto max-h-[220px]">
                    <img
                      src={puzzleImage}
                      alt="Uploaded target puzzle"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => {
                        setPuzzleImage(null);
                        setComparisonMatches(null);
                      }}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 p-1.5 rounded-lg text-white shadow-md cursor-pointer text-xs"
                    >
                      Change Photo
                    </button>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-zinc-400">
                    File registered successfully. Ready for computer vision matching.
                  </p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer space-y-3.5 py-8 w-full h-full">
                  <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-xs text-zinc-400">
                    <Upload className="w-6 h-6 text-zinc-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block underline hover:text-black">
                      Select layout snapshot file
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono font-bold uppercase block mt-1.5">
                      or drag and drop puzzle photo here
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePuzzleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Scan trigger button */}
            <button
              onClick={analyzePuzzle}
              disabled={isAnalyzing || !puzzleImage}
              className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold rounded-xl py-4 text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Aligning Multi-group layout frames...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Process Puzzle & Search Matching Dice</span>
                </>
              )}
            </button>

            {/* Visual Bounding Box Placement Map Overlay */}
            {!isAnalyzing && comparisonMatches !== null && puzzleImage && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-6 border-t border-zinc-150 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-widest font-mono">
                      Verified Layout Map Overlays
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {matchedDiceCount} DETECTED SPECIMENS
                  </span>
                </div>

                <div className="relative w-full overflow-hidden rounded-2xl border-2 border-zinc-200/90 shadow bg-stone-50 select-none">
                  <img
                    src={puzzleImage}
                    alt="Verified puzzle map layout"
                    className="w-full h-auto block object-contain"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Bounding box item overlay list */}
                  {comparisonMatches.map((match: any) => {
                    if (!match.exists || !match.box2d || !Array.isArray(match.box2d) || match.box2d.length < 4) return null;
                    if (match.box2d.every((val: number) => val === 0)) return null;

                    // extract percent coordinates: [ymin, xmin, ymax, xmax]
                    const [ymin, xmin, ymax, xmax] = match.box2d;
                    const top = ymin;
                    const left = xmin;
                    const width = xmax - xmin;
                    const height = ymax - ymin;

                    return (
                      <div
                        key={`overlay-die-${match.dieId}`}
                        style={{
                          position: "absolute",
                          top: `${top}%`,
                          left: `${left}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                        className="group border-2 border-emerald-500 hover:border-cyan-500 bg-emerald-500/15 hover:bg-cyan-500/20 transition-all duration-150 rounded"
                        title={`Slot Specimen #${match.dieId}: Confidence ${match.confidence}%`}
                      >
                        <div className="absolute top-1 left-1 bg-black text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded shadow-lg border border-emerald-400 select-none leading-none z-10 whitespace-nowrap opacity-90 group-hover:opacity-100 group-hover:border-cyan-400 transition-all">
                          Specimen #{match.dieId}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono text-center leading-relaxed">
                  * Bounding boxes approximate the coordinates detected by Gemini pattern search matching.
                </p>
              </motion.div>
            )}
          </section>

          {/* RIGHT: COMPARISON MATRICES & MATCH OVERALL RESULTS */}
          <section className="lg:col-span-6 space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 p-5 rounded-3xl space-y-2 text-left"
                >
                  <div className="flex gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                        Verification Blocked
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loader placeholder */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl border-2 border-zinc-200/95 p-8 text-center flex flex-col items-center justify-center min-h-[350px] space-y-4"
                >
                  <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-900 font-mono tracking-widest uppercase animate-pulse">
                      Analyzing Physical Geometry
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">
                      Wait while Gemini performs direct visual search and matches your loaded rack keys to target positions...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Results populated */}
              {!isAnalyzing && comparisonMatches !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 animate-fade-in"
                  id="results-view"
                >
                  {/* Presence score counter */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 shadow-md border border-zinc-950 relative overflow-hidden">
                    {/* Abstract tech decoration */}
                    <div className="absolute right-0 bottom-0 opacity-15 text-[120px] font-mono leading-none select-none font-bold transform translate-x-1/4 translate-y-1/4">
                      {matchedDiceCount}
                    </div>

                    <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400">
                          SPECIMEN_VERIFICATION_MATCH_SCORE
                        </span>
                        <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-sm uppercase">
                          COMPLETE
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black font-display text-white">
                          {matchedDiceCount} <span className="text-zinc-500 text-xl font-medium">of</span> {totalRegisteredCount}
                        </p>
                      </div>

                      <p className="text-xs text-zinc-350 leading-relaxed max-w-md">
                        {totalRegisteredCount === 0 ? (
                          <span className="text-yellow-400 font-bold">
                            ⚠️ Zero constant rack specimens are registered. Upload single die photos above to run direct pattern-matching search checks!
                          </span>
                        ) : matchedDiceCount === 0 ? (
                          "0 registered specimens were found in this layout snapshot image."
                        ) : (
                          `Verification complete: Out of your ${totalRegisteredCount} registered physical specimens, ${matchedDiceCount} matching dice were verified inside the puzzle picture.`
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Presence table/matching details list */}
                  <div className="bg-white border-2 border-zinc-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-widest font-mono border-b border-zinc-150 pb-3 block">
                      Individual Verification Checklist
                    </h4>

                    {totalRegisteredCount === 0 ? (
                      <p className="text-xs text-zinc-500 italic p-4 text-center">
                        No custom specimen rack definitions to trace. Populate items in the top rack.
                      </p>
                    ) : (
                      <div className="divide-y divide-zinc-150/80">
                        {(Object.values(rack) as CustomDie[]).map((die) => {
                          const matchItem = comparisonMatches.find(m => m.dieId === die.id);
                          return (
                            <div key={`check-${die.id}`} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                              {/* Die information thumbnail */}
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 shrink-0 shadow-xs">
                                  <img src={die.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <span className="font-mono font-black text-zinc-900 block text-xs">
                                    Slot Specimen #{die.id}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-zinc-400 mt-1 block">
                                    Uploaded: {die.uploadedAt}
                                  </span>
                                </div>
                              </div>

                              {/* Match state outcome */}
                              {matchItem ? (
                                matchItem.exists ? (
                                  <div className="text-left sm:text-right flex flex-col items-start sm:items-end max-w-sm">
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 leading-none uppercase shrink-0">
                                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      ✓ FOUND IN PUZZLE
                                    </span>
                                    <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
                                      {matchItem.reason}
                                    </p>
                                    <span className="text-[8px] font-mono font-black text-zinc-400 mt-1 block">
                                      Confidence: {Math.round(matchItem.confidence * 100)}%
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-left sm:text-right flex flex-col items-start sm:items-end max-w-sm">
                                    <span className="text-[10px] font-black text-red-650 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg flex items-center gap-1 leading-none uppercase shrink-0">
                                      ✕ MISSING
                                    </span>
                                    <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                                      {matchItem.reason || "Unable to locate match in target layout."}
                                    </p>
                                    <span className="text-[8px] font-mono font-black text-zinc-400 mt-1 block">
                                      Confidence: {Math.round(matchItem.confidence * 100)}%
                                    </span>
                                  </div>
                                )
                              ) : (
                                <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                                  <span className="text-[10px] font-black text-zinc-400 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg uppercase leading-none">
                                    Pending Match
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Poetic feedback */}
                  {analysisText && (
                    <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-md space-y-2 border">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Exhibit Layout Analysis Narrative
                      </h4>
                      <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                        {analysisText}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Inactive result placeholders */}
              {!isAnalyzing && comparisonMatches === null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl border-2 border-zinc-200/90 p-8 text-center flex flex-col items-center justify-center min-h-[350px] space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl border-2 border-dotted border-zinc-350 flex items-center justify-center text-zinc-400 bg-zinc-50 shadow-xs">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-xs font-bold text-zinc-900 font-mono tracking-widest uppercase">
                      Analysis View Awaiting
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Upload your puzzle image layout on the left, then trigger the processing sequence to find matched physical specimen positions.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200/80 bg-zinc-100 py-6 text-zinc-500 text-xs mt-16 font-mono font-bold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-[10px]">
            CONOPS_STATUS: COMPLIANT • TWO_GROUP_MODE
          </p>
          <p className="text-[10px] bg-white text-zinc-800 px-3 py-1 rounded border shadow-xs leading-none">
            INTELLIGENCE: gemini-3.5-flash
          </p>
        </div>
      </footer>

      {/* DIALOG: SPECIMEN QUICK DEFINITION MODAL */}
      <AnimatePresence>
        {activeSlotId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSlotId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-zinc-950 relative shadow-2xl space-y-6 z-10 text-left"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-200 bg-zinc-100 shadow-inner shrink-0">
                    {rack[activeSlotId] ? (
                      <>
                        <img 
                          src={rack[activeSlotId].imageUrl} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/45" />
                        <span className="relative z-10 text-white font-mono font-black text-xs">
                          {activeSlotId}
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-700 font-mono font-black text-xs">
                        {activeSlotId}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 font-display">
                    Define Dice Slot Specimen
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSlotId(null)}
                  className="text-zinc-400 hover:text-zinc-600 text-sm font-black p-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Choose methods */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                    Upload physical die close-up
                  </span>
                  
                  <label className="border-2 border-dashed border-zinc-300 hover:border-zinc-900 rounded-2xl p-6 text-center cursor-pointer hover:bg-zinc-50/55 flex flex-col items-center justify-center gap-2 transition duration-150 relative overflow-hidden min-h-[150px]">
                    {rack[activeSlotId] ? (
                      <>
                        <img 
                          src={rack[activeSlotId].imageUrl} 
                          alt="Current Specimen" 
                          className="absolute inset-0 w-full h-full object-cover opacity-25"
                        />
                        <div className="absolute inset-0 bg-white/70 hover:bg-white/55 transition-colors" />
                      </>
                    ) : null}
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                      <Upload className="w-5 h-5 text-zinc-650" />
                      <span className="text-xs font-bold text-zinc-900 block underline">
                        {rack[activeSlotId] ? "Replace specimen photo" : "Click to choose image file"}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold block leading-none">JPEG, PNG, WEBP</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              handleDiePhotoUpload(activeSlotId, reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="bg-zinc-50 p-3 rounded-2xl flex gap-2 text-zinc-500 font-mono text-[9px] leading-relaxed border select-none">
                <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <p>
                  Images are securely stored inside your client's web storage (localStorage) to persist setup parameters.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
