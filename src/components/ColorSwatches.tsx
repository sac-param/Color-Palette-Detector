import React, { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { ColorItem } from "../types";

interface ColorSwatchesProps {
  colors: ColorItem[];
}

export default function ColorSwatches({ colors }: ColorSwatchesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-4" id="color-swatches-root">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans">
          Dominant Color Palette
        </h3>
        <div className="h-[1px] bg-zinc-200 flex-1"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {colors.map((color, index) => {
          const rgbString = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
          const isDark = (color.rgb.r * 299 + color.rgb.g * 587 + color.rgb.b * 114) / 1000 < 130;
          const cardId = `dom-${index}`;

          return (
            <div
              key={cardId}
              className="bg-white rounded-2xl border-2 border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Color Block */}
              <div
                className="h-28 relative flex items-end p-3 transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(color.hex, `${cardId}-block`)}
              >
                {/* Floating percentage tag */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded text-xs font-bold text-zinc-900 shadow-sm border border-zinc-200 flex items-center gap-1">
                  <span>{color.percentage}%</span>
                </div>

                {/* Micro copy button */}
                <div
                  className="absolute bottom-3 right-3 p-1.5 rounded transition-colors shadow-sm"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
                    color: isDark ? "#FFFFFF" : "#171717",
                  }}
                  title="Copy Hex"
                >
                  {copiedId === `${cardId}-block` ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </div>

                {/* Swatch info label */}
                <span
                  className="text-xs font-mono font-bold shadow-sm bg-zinc-950/40 text-white backdrop-blur-xs px-2 py-0.5 rounded"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                >
                  {color.hex}
                </span>
              </div>

              {/* Color details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-900 text-sm tracking-tight">{color.name}</h4>
                  </div>

                  {/* Context Description */}
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                    <span>{color.description}</span>
                  </p>
                </div>

                {/* Code strings split display */}
                <div className="pt-3 border-t border-dashed border-zinc-200 flex gap-1 bg-zinc-50/50 p-2 rounded-lg text-[11px] font-mono">
                  <div className="flex-1 flex justify-between items-center px-1.5 py-0.5 bg-white rounded border border-zinc-200">
                    <span className="text-zinc-400 text-[10px]">HEX:</span>
                    <button
                      onClick={() => copyToClipboard(color.hex, `${cardId}-hex`)}
                      className="text-zinc-800 hover:text-black font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>{color.hex}</span>
                      {copiedId === `${cardId}-hex` ? (
                        <Check className="w-3 h-3 text-emerald-650" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 flex justify-between items-center px-1.5 py-0.5 bg-white rounded border border-zinc-200">
                    <span className="text-zinc-400 text-[10px]">RGB:</span>
                    <button
                      onClick={() => copyToClipboard(rgbString, `${cardId}-rgb`)}
                      className="text-zinc-800 hover:text-black font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>{color.rgb.r},{color.rgb.g},{color.rgb.b}</span>
                      {copiedId === `${cardId}-rgb` ? (
                        <Check className="w-3 h-3 text-emerald-650" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
