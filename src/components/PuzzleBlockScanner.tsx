import React, { useState, useEffect } from "react";
import { 
  Check, 
  Copy, 
  Grid, 
  Layers, 
  Terminal, 
  Info, 
  AlertOctagon, 
  Play, 
  RotateCcw, 
  Plus, 
  Save, 
  Sparkles, 
  HelpCircle, 
  Shuffle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Layout,
  BookOpen,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { DetectedBlock } from "../types";
import { compressImage } from "../utils/imageCompressor";
import { 
  CONSTANT_DICE_SPECS, 
  DEFAULT_SAVED_PATTERNS, 
  findClosestDiceId, 
  DicePosition, 
  SavedPattern, 
  DiceSpec 
} from "../data/diceData";

interface PuzzleBlockScannerProps {
  blocks?: DetectedBlock[];
}

export interface CustomDieData {
  imageUrl: string;
  avgColor: { r: number; g: number; b: number; hex: string };
}

// Extract average color from base64 image via Canvas
export const extractAverageColor = (base64Str: string): Promise<{ r: number; g: number; b: number; hex: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        const r = data[0];
        const g = data[1];
        const b = data[2];
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        resolve({ r, g, b, hex });
      } else {
        resolve({ r: 128, g: 128, b: 128, hex: "#808080" });
      }
    };
    img.onerror = () => {
      resolve({ r: 128, g: 128, b: 128, hex: "#808080" });
    };
  });
};

// Programmatic organic & tech textures generator to bypass CORS and feel professional
export const generateProgrammaticTexture = (hexColor: string, type: 'wood' | 'marble' | 'carbon' | 'brushed'): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  if (!ctx) return hexColor;

  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, 120, 120);

  const shadeColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#",""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) + amt,
          G = (num >> 8 & 0x00FF) + amt,
          B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
  };

  const darkShade = shadeColor(hexColor, -25);
  const lightShade = shadeColor(hexColor, 25);

  if (type === 'wood') {
    ctx.strokeStyle = darkShade;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let y = -40; y < 160; y += 14) {
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(40, y + 6, 80, y - 6, 120, y + 3);
    }
    ctx.globalAlpha = 0.45;
    ctx.stroke();

    ctx.strokeStyle = lightShade;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let y = -46; y < 160; y += 14) {
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(35, y + 4, 75, y - 8, 120, y + 2);
    }
    ctx.stroke();

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = darkShade;
    ctx.beginPath();
    ctx.arc(60, 60, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(60, 60, 12, 0, Math.PI * 2);
    ctx.stroke();
  } 
  else if (type === 'marble') {
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = darkShade;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.bezierCurveTo(40, 30, 20, 60, 80, 120);
    ctx.moveTo(90, 0);
    ctx.bezierCurveTo(60, 40, 100, 80, 50, 120);
    ctx.stroke();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.bezierCurveTo(42, 32, 22, 62, 82, 120);
    ctx.moveTo(0, 40);
    ctx.bezierCurveTo(40, 60, 80, 30, 120, 70);
    ctx.stroke();
  } 
  else if (type === 'carbon') {
    ctx.globalAlpha = 0.35;
    for (let x = 0; x < 120; x += 10) {
      for (let y = 0; y < 120; y += 10) {
        if ((x + y) % 20 === 0) {
          ctx.fillStyle = darkShade;
          ctx.fillRect(x, y, 9, 9);
        } else {
          ctx.fillStyle = lightShade;
          ctx.fillRect(x, y, 9, 9);
        }
      }
    }
  } 
  else if (type === 'brushed') {
    ctx.strokeStyle = lightShade;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 0.8;
    for (let y = 0; y < 120; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random() * 2 - 1));
      ctx.lineTo(120, y + (Math.random() * 2 - 1));
      ctx.stroke();
    }
    const gradient = ctx.createLinearGradient(0, 0, 120, 120);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.255)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, 0, 120, 120);
  }

  return canvas.toDataURL("image/png");
};

export const PuzzleBlockScanner: React.FC<PuzzleBlockScannerProps> = ({ blocks = [] }) => {
  // State for physical photo custom dice textures & average colors
  const [customDice, setCustomDice] = useState<Record<number, CustomDieData>>(() => {
    const local = localStorage.getItem("custom_dice_photos");
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return {};
  });

  // Unique custom distance matching for uploaded user photo squares
  const findClosestDiceIdCustom = (r: number, g: number, b: number) => {
    let closestId = 1;
    let minDistance = Infinity;

    for (const dice of CONSTANT_DICE_SPECS) {
      let dR = 0, dG = 0, dB = 0;

      const custom = customDice[dice.id];
      if (custom && custom.avgColor) {
        dR = custom.avgColor.r;
        dG = custom.avgColor.g;
        dB = custom.avgColor.b;
      } else {
        // Fallback to sRGB specs
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(dice.defaultHex);
        if (result) {
          dR = parseInt(result[1], 16);
          dG = parseInt(result[2], 16);
          dB = parseInt(result[3], 16);
        }
      }

      const distance = Math.sqrt(
        Math.pow(r - dR, 2) +
        Math.pow(g - dG, 2) +
        Math.pow(b - dB, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestId = dice.id;
      }
    }

    return closestId;
  };

  // State for active dice layout configuration
  const [activePositions, setActivePositions] = useState<DicePosition[]>(() => {
    // Start with default layout matching "Symmetrical Sorter" for a beautiful initial experience!
    return [...DEFAULT_SAVED_PATTERNS[0].positions];
  });

  // State for selected dice to place
  const [selectedDiceId, setSelectedDiceId] = useState<number | null>(null);

  // Saved patterns (load from localstorage if exists, otherwise defaults)
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>(() => {
    const local = localStorage.getItem("exhibit_saved_patterns");
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return DEFAULT_SAVED_PATTERNS;
  });

  // Dynamic analysis states
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [matchedResults, setMatchedResults] = useState<Array<{ pattern: SavedPattern; percentage: number; matchCount: number }>>([]);
  const [newPatternName, setNewPatternName] = useState("");
  const [newPatternDesc, setNewPatternDesc] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isScanningSim, setIsScanningSim] = useState(false);

  // Sync detected blocks from raw uploaded image
  useEffect(() => {
    if (blocks && blocks.length > 0) {
      setIsScanningSim(true);
      const mapped: DicePosition[] = blocks.map((b) => {
        const diceId = findClosestDiceIdCustom(b.rgb.r, b.rgb.g, b.rgb.b);
        return {
          diceId,
          tray: b.group,
          row: b.row,
          col: b.col
        };
      });

      // Filter uniques to prevent double-binding
      const uniqueMapped: DicePosition[] = [];
      const seen = new Set<string>();
      mapped.forEach((pos) => {
        const key = `${pos.tray}-${pos.row}-${pos.col}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMapped.push(pos);
        }
      });

      setActivePositions(uniqueMapped);
      
      // Auto-validate and compare
      setTimeout(() => {
        executePatternAnalysis(uniqueMapped);
        setIsScanningSim(false);
        // Scroll to analysis results
        const element = document.getElementById("analysis-results-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 800);
    }
  }, [blocks]);

  // Run validation + matching logic
  const executePatternAnalysis = (positionsList: DicePosition[]) => {
    setAnalysisError(null);
    setIsAnalyzed(true);

    // 1. FIRST CHECK: Test if Blue and Green trays are physically swapped / core mismatch
    // Green tray is Left_Half, Blue tray is Right_Half
    // Core green dice: 1, 2, 3 must be in left tray (Green tray)
    // Core blue dice: 13, 14, 15 must be in right tray (Blue tray)
    const misplacedCoreGreen = positionsList.filter(
      p => p.tray === "right" && (p.diceId === 1 || p.diceId === 2 || p.diceId === 3)
    );
    const misplacedCoreBlue = positionsList.filter(
      p => p.tray === "left" && (p.diceId === 13 || p.diceId === 14 || p.diceId === 15)
    );

    if (misplacedCoreGreen.length > 0 || misplacedCoreBlue.length > 0) {
      setAnalysisError(
        "CRITICAL ERROR: TRAY SWAPPED / CORE MISMATCH DETECTED! " +
        `We found Core Green dice in the Blue tray (Right half) or Core Blue dice in the Green tray (Left half). ` +
        "Please rearrange the central core trays correctly before pressing the red verification button."
      );
      setMatchedResults([]);
      return;
    }

    // 1b. Additional structural swap check: if Left is entirely BLUE spectrum or Right is entirely GREEN spectrum
    const leftDiceSpecs = positionsList.filter(p => p.tray === "left").map(p => CONSTANT_DICE_SPECS.find(d => d.id === p.diceId)).filter(Boolean) as DiceSpec[];
    const rightDiceSpecs = positionsList.filter(p => p.tray === "right").map(p => CONSTANT_DICE_SPECS.find(d => d.id === p.diceId)).filter(Boolean) as DiceSpec[];
    
    const leftIsMostlyBlue = leftDiceSpecs.filter(d => d.category === "core-blue" || d.category === "blue-ish").length > leftDiceSpecs.length * 0.6 && leftDiceSpecs.length > 2;
    const rightIsMostlyGreen = rightDiceSpecs.filter(d => d.category === "core-green" || d.category === "green-ish").length > rightDiceSpecs.length * 0.6 && rightDiceSpecs.length > 2;
    
    if (leftIsMostlyBlue || rightIsMostlyGreen) {
      setAnalysisError(
        "CRITICAL ERROR: TRAY ROTATION / FULL LAYOUT SWAP DETECTED! " +
        "The Green yard tray is heavily blue and the Blue yard tray is heavily green. Swapping tray zones physically violates exhibit sorting rules."
      );
      setMatchedResults([]);
      return;
    }

    // 2. SUCCESS: Compare active placement with all saved exhibit configurations
    const comparison = savedPatterns.map(pattern => {
      let matches = 0;

      // Check position match for each of the 15 physical dice
      for (let diceId = 1; diceId <= 15; diceId++) {
        const activePos = positionsList.find(p => p.diceId === diceId);
        const patternPos = pattern.positions.find(p => p.diceId === diceId);

        if (!activePos && !patternPos) {
          // Both unplaced is a match of position (or exclude; we want position exact match)
          matches++;
        } else if (activePos && patternPos) {
          if (
            activePos.tray === patternPos.tray &&
            activePos.row === patternPos.row &&
            activePos.col === patternPos.col
          ) {
            matches++;
          }
        }
      }

      const percentage = Math.round((matches / 15) * 100);
      return {
        pattern,
        percentage,
        matchCount: matches
      };
    });

    // Sort matching results descending
    comparison.sort((a, b) => b.percentage - a.percentage);
    setMatchedResults(comparison);
  };

  // Run automatically when layout changes
  useEffect(() => {
    executePatternAnalysis(activePositions);
  }, [activePositions, savedPatterns]);

  // Click handler to assign a die to a slot
  const handleSlotClick = (tray: "left" | "right", row: number, col: number) => {
    if (selectedDiceId === null) {
      // If slot is occupied, select that die for quick swapping!
      const currentInSlot = activePositions.find(p => p.tray === tray && p.row === row && p.col === col);
      if (currentInSlot) {
        setSelectedDiceId(currentInSlot.diceId);
      }
      return;
    }

    // Determine if another die was in this target slot
    const previousInSlot = activePositions.find(p => p.tray === tray && p.row === row && p.col === col);

    // Remove selected die from any previous slot it occupied, and bind it to the target slot
    let updated = activePositions.filter(p => p.diceId !== selectedDiceId);

    if (previousInSlot) {
      // Remove previous die in slot (unplaces it)
      updated = updated.filter(p => p.diceId !== previousInSlot.diceId);
    }

    // Place selected die in target slot
    updated.push({
      diceId: selectedDiceId,
      tray,
      row,
      col
    });

    setActivePositions(updated);
    setSelectedDiceId(null);
  };

  // Quick action: clear a slot
  const clearSlot = (tray: "left" | "right", row: number, col: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePositions(prev => prev.filter(p => !(p.tray === tray && p.row === row && p.col === col)));
  };

  // Quick preset: load a specific pattern
  const loadPattern = (pattern: SavedPattern) => {
    setActivePositions([...pattern.positions]);
    setSelectedDiceId(null);
  };

  // Quick preset: clear everything (put all back in rack)
  const clearAllTrays = () => {
    setActivePositions([]);
    setSelectedDiceId(null);
  };

  // Quick preset: trigger real randomized swap (forces error)
  const simulateTraySwapError = () => {
    // Invert left & right tray tags on active layout to demonstrate error!
    const swapped = activePositions.map(p => ({
      ...p,
      tray: p.tray === "left" ? ("right" as const) : ("left" as const)
    }));
    setActivePositions(swapped);
    setSelectedDiceId(null);
  };

  // Save the current layout as a custom pattern
  const handleSavePattern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatternName.trim()) return;

    const newPat: SavedPattern = {
      id: `pat-custom-${Date.now()}`,
      name: newPatternName.trim(),
      description: newPatternDesc.trim() || "User generated custom exhibit template configuration.",
      difficulty: "Medium",
      positions: [...activePositions]
    };

    const updatedPatterns = [...savedPatterns, newPat];
    setSavedPatterns(updatedPatterns);
    localStorage.setItem("exhibit_saved_patterns", JSON.stringify(updatedPatterns));

    setNewPatternName("");
    setNewPatternDesc("");
    setShowSaveForm(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reset to default patterns
  const resetToDefaultPatterns = () => {
    if (window.confirm("Are you sure you want to reset all custom patterns?")) {
      setSavedPatterns(DEFAULT_SAVED_PATTERNS);
      localStorage.removeItem("exhibit_saved_patterns");
    }
  };

  // Group helpers
  const leftGridList = activePositions.filter(p => p.tray === "left");
  const rightGridList = activePositions.filter(p => p.tray === "right");
  
  // Matrix helpers (3x3 grid size)
  const renderInteractiveMatrix = (list: DicePosition[]) => {
    const matrix: (DicePosition | null)[][] = Array(3).fill(null).map(() => Array(3).fill(null));
    list.forEach(item => {
      if (item.row < 3 && item.col < 3) {
        matrix[item.row][item.col] = item;
      }
    });
    return matrix;
  };

  const leftMatrix = renderInteractiveMatrix(leftGridList);
  const rightMatrix = renderInteractiveMatrix(rightGridList);

  // Unplaced dice helper (lies in the rack)
  const placedDiceIds = new Set(activePositions.map(p => p.diceId));
  const unplacedDice = CONSTANT_DICE_SPECS.filter(d => !placedDiceIds.has(d.id));

  return (
    <div className="space-y-8" id="exhibit-scanner-root">
      
      {/* Visual Header Banner - Exhibit Console Theme */}
      <div className="bg-zinc-950 text-white p-6 rounded-3xl border-4 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-300 uppercase">Interactive Exhibition Station</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-sans text-white">
            CHOOSE YOUR <span className="text-blue-400">BLUE</span> AND <span className="text-emerald-400">GREEN</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            A real-time puzzle sorting exhibit interface. Divide the 15 physical dice into their correct tray yards (Green on the left, Blue on the right). Match saved templates and check your sorting symmetry!
          </p>
        </div>

        {/* Tactical Info Badge */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 text-center z-10 shrink-0">
          <div>
            <div className="text-xl font-mono font-black text-rose-500">{activePositions.length}/15</div>
            <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Placed Dice</div>
          </div>
          <div className="border-l border-zinc-805" />
          <div>
            <div className="text-xl font-mono font-black text-yellow-400">{savedPatterns.length}</div>
            <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Saved Layouts</div>
          </div>
        </div>
      </div>

      {/* THREE COVERS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: The Interactive Trays (Col Span 8) */}
        <div className="xl:col-span-8 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-zinc-500" />
              Physical Assembly Board Simulator
            </h3>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={clearAllTrays}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition flex items-center gap-1 cursor-pointer"
                title="Clear all active tray positions"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                CLEAR ALL
              </button>
              <button
                onClick={simulateTraySwapError}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                title="Swaps left/right coordinates to test physical tray error"
              >
                <Shuffle className="w-3.5 h-3.5" />
                TRIGGER SWAP ERROR
              </button>
            </div>
          </div>

          {/* DUAL TRAYS CONTAINER */}
          <div className="bg-zinc-100 rounded-3xl p-6 md:p-8 border-4 border-zinc-300 shadow-md">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* GREEN TRAY (LEFT SPECTRUM) */}
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-2xl">
                  <span className="text-xs font-black font-mono text-emerald-800 tracking-wider uppercase">
                    🟢 GREEN YARD (LEFT HALF)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white/60 px-2 py-0.5 rounded border border-emerald-300/30">
                    {leftGridList.length} PLACED
                  </span>
                </div>

                {/* 3x3 Grid Board */}
                <div className="aspect-square bg-zinc-900 rounded-2xl p-4 border-[6px] border-emerald-800 shadow-inner grid grid-rows-3 gap-3 relative">
                  {/* Subtle watermarked board grid labels */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] text-7xl font-mono font-black pointer-events-none select-none text-emerald-400">
                    GREEN
                  </div>

                  {leftMatrix.map((rowArr, rIdx) => (
                    <div key={`left-r-${rIdx}`} className="grid grid-cols-3 gap-3">
                      {rowArr.map((pos, cIdx) => {
                        const spec = pos ? CONSTANT_DICE_SPECS.find(d => d.id === pos.diceId) : null;
                        const isSelected = selectedDiceId !== null && pos?.diceId === selectedDiceId;
                        return (
                          <div
                            key={`left-${rIdx}-${cIdx}`}
                            onClick={() => handleSlotClick("left", rIdx, cIdx)}
                            className={`aspect-square rounded-xl relative flex flex-col items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden ${
                              pos 
                                ? "shadow-md hover:scale-[1.04] border-2 border-zinc-950" 
                                : "border-2 border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-950/40 hover:bg-emerald-950/20"
                            } ${isSelected ? "ring-4 ring-yellow-400 scale-[1.05] z-10" : ""}`}
                            style={{ 
                              backgroundImage: spec && customDice[spec.id] ? `url(${customDice[spec.id].imageUrl})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: spec ? (customDice[spec.id]?.avgColor.hex || spec.defaultHex) : "transparent"
                            }}
                          >
                            {spec && <span className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none" />}
                            {/* Grid Index Watermark */}
                            <span className="absolute top-1.5 left-1.5 text-[8px] font-mono text-zinc-500 font-bold select-none">
                              R{rIdx}C{cIdx}
                            </span>

                            {spec ? (
                              <div className="text-center p-1.5 max-w-full">
                                <span className="text-xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-mono">
                                  {spec.id}
                                </span>
                                <p className="text-[7.5px] font-bold text-white/90 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.6)] uppercase truncate max-w-full leading-none mt-1">
                                  {spec.name.split("(")[1]?.replace(")", "") || spec.name}
                                </p>
                                
                                {/* Deselect/Clear button */}
                                <button
                                  onClick={(e) => clearSlot("left", rIdx, cIdx, e)}
                                  className="absolute top-1 right-1 w-4 h-4 bg-black/60 rounded-full text-[8px] text-zinc-300 hover:text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
                                  title="Unplace die"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-650 opacity-40 font-bold uppercase select-none">Empty</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* BLUE TRAY (RIGHT SPECTRUM) */}
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 rounded-2xl">
                  <span className="text-xs font-black font-mono text-blue-800 tracking-wider uppercase">
                    🔵 BLUE YARD (RIGHT HALF)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-white/60 px-2 py-0.5 rounded border border-blue-300/30">
                    {rightGridList.length} PLACED
                  </span>
                </div>

                {/* 3x3 Grid Board */}
                <div className="aspect-square bg-zinc-900 rounded-2xl p-4 border-[6px] border-blue-800 shadow-inner grid grid-rows-3 gap-3 relative">
                  {/* Subtle watermarked board grid labels */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] text-7xl font-mono font-black pointer-events-none select-none text-blue-400">
                    BLUE
                  </div>

                  {rightMatrix.map((rowArr, rIdx) => (
                    <div key={`right-r-${rIdx}`} className="grid grid-cols-3 gap-3">
                      {rowArr.map((pos, cIdx) => {
                        const spec = pos ? CONSTANT_DICE_SPECS.find(d => d.id === pos.diceId) : null;
                        const isSelected = selectedDiceId !== null && pos?.diceId === selectedDiceId;
                        return (
                          <div
                            key={`right-${rIdx}-${cIdx}`}
                            onClick={() => handleSlotClick("right", rIdx, cIdx)}
                            className={`aspect-square rounded-xl relative flex flex-col items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden ${
                              pos 
                                ? "shadow-md hover:scale-[1.04] border-2 border-zinc-950" 
                                : "border-2 border-dashed border-zinc-700 hover:border-blue-500 bg-zinc-950/40 hover:bg-blue-950/20"
                            } ${isSelected ? "ring-4 ring-yellow-400 scale-[1.05] z-10" : ""}`}
                            style={{ 
                              backgroundImage: spec && customDice[spec.id] ? `url(${customDice[spec.id].imageUrl})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: spec ? (customDice[spec.id]?.avgColor.hex || spec.defaultHex) : "transparent"
                            }}
                          >
                            {spec && <span className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none" />}
                            {/* Grid Index Watermark */}
                            <span className="absolute top-1.5 left-1.5 text-[8px] font-mono text-zinc-500 font-bold select-none">
                              R{rIdx}C{cIdx}
                            </span>

                            {spec ? (
                              <div className="text-center p-1.5 max-w-full">
                                <span className="text-xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-mono">
                                  {spec.id}
                                </span>
                                <p className="text-[7.5px] font-bold text-white/90 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.6)] uppercase truncate max-w-full leading-none mt-1">
                                  {spec.name.split("(")[1]?.replace(")", "") || spec.name}
                                </p>
                                
                                {/* Deselect/Clear button */}
                                <button
                                  onClick={(e) => clearSlot("right", rIdx, cIdx, e)}
                                  className="absolute top-1 right-1 w-4 h-4 bg-black/60 rounded-full text-[8px] text-zinc-300 hover:text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
                                  title="Unplace die"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-650 opacity-40 font-bold uppercase select-none">Empty</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* TACTILE PHYSICAL RED SCANNING BUTTON */}
          <div className="flex flex-col items-center justify-center py-4 bg-zinc-50 border-2 border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600 animate-pulse" />
            
            <p className="text-xs text-zinc-500 text-center max-w-md font-sans">
              Once you have finished placing the dice in both trays (or uploaded a photo), press the physical console button below to execute pattern analysis!
            </p>

            <button
              onClick={() => {
                setIsScanningSim(true);
                setTimeout(() => {
                  executePatternAnalysis(activePositions);
                  setIsScanningSim(false);
                  // scroll
                  const element = document.getElementById("analysis-results-section");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }, 600);
              }}
              disabled={isScanningSim}
              className={`relative cursor-pointer select-none group w-48 h-48 rounded-full bg-zinc-950 border-8 border-zinc-300 shadow-2xl flex flex-col items-center justify-center transition-all active:scale-95 active:border-zinc-500 ${
                isScanningSim ? "animate-pulse" : "hover:border-zinc-400"
              }`}
            >
              <div className="w-[110px] h-[110px] rounded-full bg-red-600 group-hover:bg-red-500 transition-colors border shadow-inner flex flex-col items-center justify-center text-center p-2 relative animate-none">
                {/* 3D button gradient/highlights */}
                <div className="absolute top-1 left-2 right-2 h-1/3 bg-white/20 rounded-t-full filter blur-[1px] pointer-events-none" />
                
                {isScanningSim ? (
                  <span className="text-[11px] font-mono font-black text-white uppercase tracking-widest leading-none">
                    SCANNING...
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-black text-white tracking-widest font-mono uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                      VERIFY
                    </span>
                    <span className="text-[8px] font-bold text-red-100 uppercase tracking-wider font-mono drop-shadow-[0_1.5px_0.5px_rgba(0,0,0,0.5)]">
                      RED_BUTTON
                    </span>
                  </>
                )}
              </div>
            </button>
            <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-widest">
              exhibit console sensor triggers
            </span>
          </div>

          {/* MASTER LOGS TABLE (All color codes logged explicitly as requested) */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-950 shadow-xl overflow-hidden font-mono text-zinc-300 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  REAL-TIME_EXHIBIT_DICE_COLOR_CODES_LOG
                </span>
              </div>
              <span className="text-[9px] text-zinc-400 font-bold">
                TOTAL: {activePositions.length}/15 ACTIVE
              </span>
            </div>

            {activePositions.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">
                No dice are currently placed. Click on any dice from the side rack to start arranging them in the trays.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider">
                      <th className="pb-2 font-bold">DICE #</th>
                      <th className="pb-2 font-bold">YARD ZONE</th>
                      <th className="pb-2 font-bold">GRID POS</th>
                      <th className="pb-2 font-bold">COLOR SWATCH</th>
                      <th className="pb-2 font-bold">COLOR NAME / SPECTRUM</th>
                      <th className="pb-2 text-right font-bold">HEX CODE</th>
                      <th className="pb-2 text-right font-bold">RGB VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePositions.map((pos) => {
                      const spec = CONSTANT_DICE_SPECS.find(d => d.id === pos.diceId);
                      if (!spec) return null;
                      return (
                        <tr key={`log-${pos.diceId}`} className="border-b border-zinc-800/50 hover:bg-zinc-850/30 transition-colors">
                          <td className="py-2.5 font-bold text-[11px] text-zinc-200">
                            Dice {spec.id}
                          </td>
                          <td className="py-2.5 font-semibold">
                            <span 
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                pos.tray === "left" 
                                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-900/30" 
                                  : "bg-blue-950/40 text-blue-300 border border-blue-900/30"
                              }`}
                            >
                              {pos.tray.toUpperCase()}_YARD
                            </span>
                          </td>
                          <td className="py-2.5 text-zinc-400 font-mono text-[10.5px]">
                            R {pos.row} : C {pos.col}
                          </td>
                          <td className="py-2.5">
                            <div 
                              className="w-8 h-4 rounded border border-white/10 shadow-xs" 
                              style={{ backgroundColor: spec.defaultHex }}
                            />
                          </td>
                          <td className="py-2.5 text-zinc-200 uppercase text-[10px] tracking-wide">
                            <span className="font-sans font-semibold text-zinc-100">{spec.name.split(" ")[2]?.replace("(", "") || spec.name}</span>
                            <span className="text-[9px] text-zinc-500 font-mono ml-1">({spec.category})</span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-emerald-400">
                            {spec.defaultHex}
                          </td>
                          <td className="py-2.5 text-right text-zinc-400 text-[10.5px]">
                            {spec.defaultHex}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: The Dice Rack & Pattern Vault (Col Span 4) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* DICE RACK PLATFORM */}
          <div className="bg-white rounded-2xl border-2 border-zinc-200 p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-zinc-400" />
                Unplaced 15 Constant Dice Rack
              </h4>
              <p className="text-xs text-zinc-500 mt-1">
                Click a die below, then click any empty slot in the Left or Right tray to place it there physically.
              </p>
            </div>

            {/* Selection Info Indicator */}
            {selectedDiceId !== null ? (
              <div className="bg-zinc-50 border-2 border-zinc-300 rounded-2xl p-4 text-xs text-zinc-800 space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-2 font-black text-zinc-900">
                    <span 
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs" 
                      style={{ backgroundColor: customDice[selectedDiceId]?.avgColor.hex || CONSTANT_DICE_SPECS.find(d => d.id === selectedDiceId)?.defaultHex }} 
                    />
                    <span>Dice {selectedDiceId} Properties</span>
                  </div>
                  <button
                    onClick={() => setSelectedDiceId(null)}
                    className="font-mono text-[9px] uppercase font-bold text-zinc-400 hover:text-zinc-700 bg-zinc-200/50 hover:bg-zinc-200 rounded px-2 py-1 transition cursor-pointer"
                  >
                    Deselect ×
                  </button>
                </div>

                {/* Dice description and current source */}
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-zinc-200">
                  <div className="text-[11px] font-bold text-zinc-800">
                    {CONSTANT_DICE_SPECS.find(d => d.id === selectedDiceId)?.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 italic">
                    {CONSTANT_DICE_SPECS.find(d => d.id === selectedDiceId)?.description}
                  </div>
                  <div className="text-[10px] font-mono flex items-center justify-between text-zinc-650 pt-1 border-t border-dashed border-zinc-200 mt-1.5">
                    <span>Color Source:</span>
                    <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                      {customDice[selectedDiceId] ? "📷 Physical Photo Image" : "💻 Digital Solid"}
                    </span>
                  </div>
                  {customDice[selectedDiceId] && (
                    <div className="text-[10px] font-mono flex items-center justify-between text-zinc-650 pt-1">
                      <span>Sampled Color:</span>
                      <span className="font-bold text-zinc-800 font-mono bg-zinc-100 border px-1.5 rounded text-[9.5px]">
                        {customDice[selectedDiceId].avgColor.hex}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Image Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 font-mono flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-450" />
                    Upload Square Die Photo (Or Generate)
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {/* Visual Preview */}
                    <div className="border border-zinc-200 rounded-xl bg-zinc-100 flex items-center justify-center relative aspect-square group overflow-hidden max-w-[100px] w-full mx-auto">
                      {customDice[selectedDiceId] ? (
                        <>
                          <img 
                            src={customDice[selectedDiceId].imageUrl} 
                            alt={`Dice ${selectedDiceId} custom photo`} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => {
                              const updatedCustom = { ...customDice };
                              delete updatedCustom[selectedDiceId];
                              setCustomDice(updatedCustom);
                              localStorage.setItem("custom_dice_photos", JSON.stringify(updatedCustom));
                            }}
                            className="absolute inset-0 bg-red-650/90 font-bold text-white text-[9.5px] uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-150"
                          >
                            Remove Photo
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center text-[10px] text-zinc-400">
                          <span className="w-8 h-8 rounded-md mb-1 shadow-xs border border-zinc-300" style={{ backgroundColor: CONSTANT_DICE_SPECS.find(d => d.id === selectedDiceId)?.defaultHex }} />
                          <span className="text-[8.5px]">Solid Color</span>
                        </div>
                      )}
                    </div>

                    {/* Trigger controls */}
                    <div className="flex flex-col justify-center space-y-2">
                      <label className="border-2 border-dashed border-zinc-300 hover:border-zinc-550 rounded-xl p-2.5 text-center cursor-pointer hover:bg-zinc-150 transition flex flex-col items-center justify-center gap-1 min-h-[60px]">
                        <Upload className="w-4 h-4 text-zinc-450" />
                        <span className="text-[10px] font-semibold text-zinc-600">Select File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = async () => {
                                if (typeof reader.result === "string") {
                                  try {
                                    const base64 = reader.result;
                                    const compressed = await compressImage(base64, 200, 200, 0.75);
                                    const extracted = await extractAverageColor(compressed);
                                    const updated = {
                                      ...customDice,
                                      [selectedDiceId]: {
                                        imageUrl: compressed,
                                        avgColor: extracted
                                      }
                                    };
                                    setCustomDice(updated);
                                    localStorage.setItem("custom_dice_photos", JSON.stringify(updated));
                                  } catch (err) {
                                    console.error("Failed custom dice scan compress:", err);
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>

                      {/* Clear trigger if exists */}
                      {customDice[selectedDiceId] && (
                        <button
                          onClick={() => {
                            const updatedCustom = { ...customDice };
                            delete updatedCustom[selectedDiceId];
                            setCustomDice(updatedCustom);
                            localStorage.setItem("custom_dice_photos", JSON.stringify(updatedCustom));
                          }}
                          className="text-[9.5px] font-bold text-red-650 hover:underline text-center cursor-pointer"
                        >
                          Reset to Solid Swatch
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Programmatic Texture Presets */}
                  <div className="pt-2.5 border-t border-dashed border-zinc-200">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Apply Predefined Physical Texture Preset:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {([
                        { type: "wood", name: "Wood" },
                        { type: "marble", name: "Marble" },
                        { type: "carbon", name: "Carbon" },
                        { type: "brushed", name: "Brushed" }
                      ] as const).map((pres) => {
                        const defaultColor = CONSTANT_DICE_SPECS.find(d => d.id === selectedDiceId)?.defaultHex || "#71717A";
                        return (
                          <button
                            key={pres.type}
                            type="button"
                            onClick={async () => {
                              const base64Tex = generateProgrammaticTexture(defaultColor, pres.type);
                              const extracted = await extractAverageColor(base64Tex);
                              const updated = {
                                ...customDice,
                                [selectedDiceId]: {
                                  imageUrl: base64Tex,
                                  avgColor: extracted
                                }
                              };
                              setCustomDice(updated);
                              localStorage.setItem("custom_dice_photos", JSON.stringify(updated));
                            }}
                            className="bg-white border text-center border-zinc-200 hover:border-zinc-400 text-[10px] font-semibold py-1 rounded-lg transition active:scale-95 cursor-pointer max-w-full truncate text-zinc-700 hover:text-zinc-900"
                          >
                            {pres.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-2.5 rounded-xl text-[9.5px] leading-relaxed text-emerald-900 border border-emerald-200/50 mt-1">
                    🎯 <span className="font-bold">Next Slot Placement:</span> After customization, click any slot in the Left or Right tray to place this die there!
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center text-xs text-zinc-550 leading-relaxed font-sans">
                💡 <span className="font-semibold text-zinc-850">Tip:</span> Select any of the 15 Constant Dice below to upload custom physical textures/photos or assign simulated preset grains! This makes sorting matches perfect for real-wood or real-plastic pieces!
              </div>
            )}

            {/* Grid of the 15 Dice */}
            <div className="grid grid-cols-5 gap-2.5">
              {CONSTANT_DICE_SPECS.map(dice => {
                const isPlaced = placedDiceIds.has(dice.id);
                const isSelected = selectedDiceId === dice.id;
                
                return (
                  <button
                    key={dice.id}
                    onClick={() => {
                      if (!isPlaced) {
                        setSelectedDiceId(dice.id);
                      } else {
                        // Locate and highlight
                        const pos = activePositions.find(p => p.diceId === dice.id);
                        if (pos) {
                          setSelectedDiceId(dice.id);
                        }
                      }
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative border-2 cursor-pointer overflow-hidden ${
                      isSelected 
                        ? "ring-4 ring-yellow-400 border-zinc-950 scale-105" 
                        : isPlaced 
                          ? "opacity-30 border-zinc-200 hover:opacity-60 scale-95" 
                          : "shadow-xs border-zinc-900 hover:scale-105 hover:shadow-md"
                    }`}
                    style={{ 
                      backgroundImage: customDice[dice.id] ? `url(${customDice[dice.id].imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: customDice[dice.id]?.avgColor.hex || dice.defaultHex 
                    }}
                    title={`${dice.name} - ${dice.description}`}
                  >
                    <span className="text-lg font-black text-white font-mono drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)] z-10">
                      {dice.id}
                    </span>

                    {/* Subtle aesthetic overlay to enrich contrast & physical feel */}
                    <span className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none" />

                    {isPlaced && (
                      <span className="absolute bottom-1 text-[7px] font-black text-white/90 font-mono tracking-tighter uppercase bg-black/60 px-1 py-0.2 rounded leading-none z-10">
                        Placed
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SPEC LEGEND BRIEF */}
            <div className="grid grid-cols-2 gap-2 text-[9px] pt-1.5 border-t border-zinc-100 text-zinc-500 font-mono">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-700" />
                <span>1-3: Core Green (Left)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-blue-700" />
                <span>13-15: Core Blue (Right)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-400" />
                <span>4-7: Greenish (Left)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-cyan-500" />
                <span>11-12: Blueish (Right)</span>
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <span className="w-2 h-2 rounded bg-teal-500 animate-pulse" />
                <span>8-10: Neutral/Both Yards</span>
              </div>
            </div>
          </div>

          {/* ACTIVE VERIFICATION ANALYSIS DISPLAY SECTION */}
          <div id="analysis-results-section" className="bg-white rounded-2xl border-2 border-zinc-200 p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                Active Sorting Verification Report
              </h4>
            </div>

            {isAnalyzed ? (
              <div className="space-y-4">
                {/* 1. TRAY SWAP / CORE MISMATCH ERROR STATE */}
                {analysisError ? (
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[11px] font-black uppercase text-rose-800 tracking-wider font-mono">
                          Tray Layout Error Stopped
                        </h5>
                        <p className="text-xs text-rose-700 leading-relaxed mt-1">
                          {analysisError}
                        </p>
                      </div>
                    </div>
                    <div className="bg-rose-900/10 p-2.5 rounded-xl text-[9.5px] font-mono text-rose-800 leading-relaxed border border-rose-200/50">
                      📝 <span className="font-bold">Sorting Rule:</span> To trigger comparison analysis, Core Green (1,2,3) must occupy Left side, and Core Blue (13,14,15) must occupy Right side. Swapping the entire trays triggers console sensors rejection.
                    </div>
                  </div>
                ) : (
                  // 2. NORMAL PATTERN MATCHING STATISTICS
                  <div className="space-y-4 text-left">
                    {/* Top closest match highlight */}
                    {matchedResults.length > 0 && (
                      <div className={`p-4 rounded-2xl border-2 ${
                        matchedResults[0].percentage === 100
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                          : "bg-zinc-50 border-zinc-300 text-zinc-900"
                      } space-y-2.5`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono">
                            Closest Template Target
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                            matchedResults[0].percentage === 100 
                              ? "bg-emerald-500 text-white animate-bounce" 
                              : "bg-zinc-200 text-zinc-800"
                          }`}>
                            {matchedResults[0].percentage}% MATCH
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black tracking-tight">{matchedResults[0].pattern.name}</h4>
                          <p className="text-xs text-zinc-650 leading-relaxed mt-1">{matchedResults[0].pattern.description}</p>
                        </div>

                        {matchedResults[0].percentage === 100 ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-[10px] text-emerald-800 font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>This exact pattern is already saved and exists in the index!</span>
                          </div>
                        ) : (
                          <div className="bg-zinc-100 border border-zinc-200 p-2 rounded-xl text-[10px] text-zinc-600 font-mono flex items-center gap-2">
                            <span>Symmetry: {matchedResults[0].matchCount}/15 dice exactly matched coordinates.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Full comparison listing */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-mono block">
                        Comparison Scores Against Pattern Index
                      </span>
                      
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {matchedResults.map((res) => (
                          <div 
                            key={`score-${res.pattern.id}`}
                            onClick={() => loadPattern(res.pattern)}
                            className="bg-white border text-left border-zinc-200 hover:border-zinc-400 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer group"
                            title="Click to load this pattern onto simulator"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-800 group-hover:text-black">{res.pattern.name}</span>
                                <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                                  res.pattern.difficulty === "Easy" ? "bg-emerald-100 text-emerald-850" :
                                  res.pattern.difficulty === "Medium" ? "bg-yellow-100 text-yellow-850" : "bg-rose-100 text-rose-850"
                                }`}>
                                  {res.pattern.difficulty}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-450 truncate max-w-[170px]">{res.pattern.description}</p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-mono font-black text-zinc-950 block">{res.percentage}%</span>
                              <span className="text-[8.5px] font-mono text-zinc-400 block">{res.matchCount}/15 dice</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SAVE ACTIVE AS NEW PATTERN FORM TRIGGER */}
                    {activePositions.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100">
                        {showSaveForm ? (
                          <form onSubmit={handleSavePattern} className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl space-y-3">
                            <h5 className="text-[10.5px] font-bold text-zinc-700 uppercase tracking-wider font-mono">
                              Save Current Pattern Layout
                            </h5>
                            
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Pattern Title</label>
                              <input 
                                type="text"
                                value={newPatternName}
                                onChange={(e) => setNewPatternName(e.target.value)}
                                placeholder="e.g. Spiral Wave"
                                required
                                className="w-full text-xs px-2 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 focus:outline-zinc-500"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Short Memo Description</label>
                              <textarea 
                                value={newPatternDesc}
                                onChange={(e) => setNewPatternDesc(e.target.value)}
                                placeholder="A balanced geometric flow..."
                                className="w-full text-xs px-2 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 focus:outline-zinc-500 min-h-[40px] resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowSaveForm(false)}
                                className="text-[10px] font-bold px-2 py-1 text-zinc-550 hover:bg-zinc-200 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-[10px] font-bold px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                SAVE INDEX
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowSaveForm(true)}
                              className="w-full text-[10px] font-bold py-2 px-3 border-2 border-zinc-305 text-zinc-700 hover:bg-zinc-50 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Save Active Placement to Index
                            </button>
                            {savedPatterns.length > DEFAULT_SAVED_PATTERNS.length && (
                              <button
                                onClick={resetToDefaultPatterns}
                                className="text-[10px] font-mono text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl border border-rose-200"
                                title="Reset patterns to defaults"
                              >
                                Clear Saved
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FLASH SUCCESS SAVE REPORT */}
                    {saveSuccess && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10.5px] font-semibold text-center animate-fade-in flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Layout configuration saved into pattern index successfully!</span>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400 italic">
                Press the Red VERIFY Button to calculate match statistics.
              </div>
            )}

          </div>

          {/* EXHIBIT RULEBOOK NOTEBOOK */}
          <div className="bg-yellow-50/70 rounded-2xl border-2 border-amber-200/60 p-5 shadow-xs text-left space-y-3">
            <h4 className="text-xs font-bold text-amber-850 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Exhibit Layout Rulebook
            </h4>
            
            <div className="text-xs text-amber-900 space-y-2.5 leading-relaxed font-sans">
              <p>
                The notebook specs specify the classification of all 15 constant physical dice cubes:
              </p>
              
              <ul className="list-disc pl-4 space-y-1 bg-white/40 p-2 rounded-xl border border-amber-200/30 text-[11px] font-mono">
                <li>
                  <span className="font-bold text-emerald-800">GREEN spectrum:</span> Dice 1, 2, 3 (Core) &amp; Dice 4, 5, 6, 7 (Green Ish)
                </li>
                <li>
                  <span className="font-bold text-blue-800">BLUE spectrum:</span> Dice 13, 14, 15 (Core) &amp; Dice 11, 12 (Blue Ish)
                </li>
                <li>
                  <span className="font-bold text-cyan-800">NEUTRAL spectrum:</span> Dice 8, 9, 10 (Falls under Both yards)
                </li>
              </ul>
              
              <div className="bg-amber-100/40 p-2 rounded-xl text-[10px] leading-relaxed border border-amber-200/50">
                ⚠️ <span className="font-bold">Core Mismatch Stop Rule:</span> Dice 1, 2, 3 (Core Green) are strictly forbidden in the Blue Yard (Right). Dice 13, 14, 15 (Core Blue) are strictly forbidden in the Green Yard (Left). Placing them incorrectly invokes sensors lockout error.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
