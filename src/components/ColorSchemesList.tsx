import React, { useState } from "react";
import { Copy, Check, Palette } from "lucide-react";
import { ColorScheme } from "../types";

interface ColorSchemesListProps {
  schemes: ColorScheme[];
}

export default function ColorSchemesList({ schemes }: ColorSchemesListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!schemes || schemes.length === 0) return null;

  return (
    <div className="space-y-4" id="color-schemes-root">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans">
          Recommended Color Schemes
        </h3>
        <div className="h-[1px] bg-zinc-200 flex-1"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme, sIndex) => {
          return (
            <div
              key={`scheme-${sIndex}`}
              className="bg-white rounded-xl border-2 border-zinc-200 p-4 shadow-sm hover:border-zinc-300 transition-all space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-black" />
                  {scheme.name}
                </h4>
              </div>

              {/* Connected Color Bar */}
              <div className="flex h-14 rounded-lg overflow-hidden shadow-inner border border-zinc-200">
                {scheme.colors.map((color, cIndex) => {
                  const uniqueId = `scheme-${sIndex}-${cIndex}`;
                  const isDark = (color.rgb.r * 299 + color.rgb.g * 587 + color.rgb.b * 114) / 1000 < 130;

                  return (
                    <div
                      key={uniqueId}
                      className="flex-1 relative group cursor-pointer transition-all hover:flex-[1.5] flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex, uniqueId)}
                    >
                      {/* Hover Info Tooltip */}
                      <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none -top-10 bg-zinc-900 text-white rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-md transition-opacity z-10 font-sans">
                        <span className="font-bold">{color.name}</span> • {color.hex}
                      </div>

                      {/* Micro Copy Indicator */}
                      <span className="hidden group-hover:flex transform scale-90 transition-transform">
                        {copiedId === uniqueId ? (
                          <Check className={`w-4 h-4 ${isDark ? "text-emerald-300" : "text-emerald-700"}`} />
                        ) : (
                          <Copy className={`w-3.5 h-3.5 ${isDark ? "text-white/80" : "text-zinc-850"}`} />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Color Details Label Table */}
              <div className="flex flex-wrap justify-between gap-1 mt-1 text-[10px] font-mono select-all">
                {scheme.colors.map((color, cIndex) => (
                  <div key={`lbl-${cIndex}`} className="flex flex-col items-start px-2 py-1 rounded bg-zinc-50 border border-zinc-200 min-w-[72px]">
                    <span className="text-zinc-500 font-sans font-bold line-clamp-1 max-w-[68px] leading-tight" title={color.name}>
                      {color.name}
                    </span>
                    <button
                      onClick={() => copyToClipboard(color.hex, `lbl-${sIndex}-${cIndex}`)}
                      className="text-zinc-800 hover:text-black font-bold flex items-center gap-0.5 mt-0.5"
                    >
                      <span>{color.hex}</span>
                      {copiedId === `lbl-${sIndex}-${cIndex}` ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-zinc-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
