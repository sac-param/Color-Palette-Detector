import React, { useRef, useState, useEffect } from "react";
import { Copy, Plus, Check, RotateCcw, AlertCircle } from "lucide-react";

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface PinnedColor {
  hex: string;
  rgb: RGBColor;
  id: string;
}

interface ImageColorPickerProps {
  imageSrc: string;
  onPinColor?: (color: PinnedColor) => void;
}

export default function ImageColorPicker({ imageSrc, onPinColor }: ImageColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: RGBColor } | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0, show: false });
  const [pinnedColors, setPinnedColors] = useState<PinnedColor[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  // Initialize hidden canvas to read pixels when image source changes
  useEffect(() => {
    if (!imageSrc) return;
    setCanvasError(null);

    const img = new Image();
    img.crossOrigin = "anonymous"; // Request CORS access for external presets
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvasRef.current = canvas;
      }
    };

    img.onerror = () => {
      // If CORS blocks pixel reading, we can gracefully inform the user
      // they can still submit for Gemini API processing (Gemini server side has no CORS problems with this).
      setCanvasError(
        "Direct pixel color extraction disabled for this external image due to security policies (CORS). You can still analyze it for the dominant AI palette!"
      );
      canvasRef.current = null;
    };
  }, [imageSrc]);

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHexVal = (val: number) => {
      const hex = val.toString(16).toUpperCase();
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHexVal(r)}${toHexVal(g)}${toHexVal(b)}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Boundary check
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      setHoverPos((prev) => ({ ...prev, show: false }));
      return;
    }

    setHoverPos({ x, y, show: true });

    // Read pixel if canvas is successfully loaded
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Calculate coordinate ratios corresponding to native size
        const ratioX = canvas.width / rect.width;
        const ratioY = canvas.height / rect.height;

        const nativeX = Math.floor(x * ratioX);
        const nativeY = Math.floor(y * ratioY);

        try {
          const pixel = ctx.getImageData(nativeX, nativeY, 1, 1).data;
          const [r, g, b] = pixel;
          const hex = rgbToHex(r, g, b);
          setHoverColor({ hex, rgb: { r, g, b } });
        } catch (err) {
          // Fallback if cross-origin canvas security triggers at runtime
          console.warn("Could not read canvas pixel data due to cross-origin policies");
        }
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverPos((prev) => ({ ...prev, show: false }));
  };

  const handleImageClick = () => {
    if (hoverColor && hoverPos.show) {
      const newColor: PinnedColor = {
        hex: hoverColor.hex,
        rgb: { ...hoverColor.rgb },
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };

      setPinnedColors((prev) => {
        // Prevent duplicate hex values in short succession
        if (prev.some((c) => c.hex === newColor.hex)) return prev;
        const updated = [newColor, ...prev].slice(0, 8); // Keep up to 8 pinned colors
        return updated;
      });

      if (onPinColor) {
        onPinColor(newColor);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearPinned = () => {
    setPinnedColors([]);
  };

  return (
    <div className="space-y-4" id="image-color-picker-root">
      {/* Interactive Image Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-zinc-200 bg-zinc-50 shadow-inner cursor-crosshair group select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
        style={{ minHeight: "220px" }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Target for analysis"
          className="w-full h-auto max-h-[480px] object-contain mx-auto transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Floating instruction badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-800 shadow-sm border border-zinc-200 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
          {canvasRef.current ? "🎯 Hover to inspect • Click to pin color" : "🌟 Ready for AI Palette analysis"}
        </div>

        {/* Real-time Magnifying Loupe Inspector */}
        {hoverPos.show && hoverColor && canvasRef.current && (
          <div
            className="absolute pointer-events-none rounded-full border-2 border-white shadow-lg flex items-center justify-center bg-white/95 backdrop-blur-sm"
            style={{
              left: `${hoverPos.x + 15}px`,
              top: `${hoverPos.y + 15}px`,
              width: "72px",
              height: "72px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15)",
              transform: hoverPos.x + 95 > (imageRef.current?.clientWidth || 0) ? "translateX(-110px)" : "none",
            }}
          >
            {/* Inner color ring */}
            <div
              className="w-12 h-12 rounded-full border border-neutral-300 flex flex-col items-center justify-center text-[9px] font-bold shadow-inner"
              style={{ backgroundColor: hoverColor.hex, color: (hoverColor.rgb.r * 299 + hoverColor.rgb.g * 587 + hoverColor.rgb.b * 114) / 1000 > 130 ? "#171717" : "#FFFFFF" }}
            >
              <span>{hoverColor.hex}</span>
            </div>
          </div>
        )}
      </div>

      {canvasError && (
        <div className="p-3 bg-zinc-100 rounded-lg border border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-550" />
          <span>{canvasError}</span>
        </div>
      )}

      {/* Pinned Colors Area */}
      {pinnedColors.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-zinc-200 p-4 space-y-3" id="pinned-colors-container">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <span>Pinned Elements</span>
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                {pinnedColors.length}/8
              </span>
            </h3>
            <button
              onClick={clearPinned}
              className="text-xs text-zinc-400 hover:text-zinc-900 font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {pinnedColors.map((color) => {
              const isDark = (color.rgb.r * 299 + color.rgb.g * 587 + color.rgb.b * 114) / 1000 < 130;
              return (
                <div
                  key={color.id}
                  className="flex items-center bg-zinc-50 hover:bg-zinc-100 rounded p-1.5 pr-3 text-xs border border-zinc-200 shadow-xs transition-all duration-250 group/item"
                >
                  <div
                    className="w-5 h-5 rounded border border-zinc-300 mr-2 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex flex-col text-left mr-3.5">
                    <span className="font-mono text-zinc-800 font-bold select-all">{color.hex}</span>
                    <span className="text-[9px] text-zinc-400 font-mono">
                      {color.rgb.r},{color.rgb.g},{color.rgb.b}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.id)}
                    className="text-zinc-400 hover:text-zinc-900 p-1 rounded hover:bg-zinc-200/50 transition-all text-[11px]"
                    title="Copy hex code"
                  >
                    {copiedId === color.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
