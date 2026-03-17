"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface InsightCardProps {
  descriptionKey: string;
  variant?: "tooltip" | "panel";
  defaultOpen?: boolean;
}

export default function InsightCard({
  descriptionKey,
  variant = "tooltip",
  defaultOpen = false,
}: InsightCardProps) {
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(defaultOpen);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip on outside click
  useEffect(() => {
    if (variant !== "tooltip" || !open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, variant]);

  const description = t(descriptionKey as any);

  if (variant === "tooltip") {
    return (
      <span className="relative inline-flex items-center">
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="text-gray-400 hover:text-cyan-500 transition-colors p-0.5 rounded-full hover:bg-cyan-50"
          aria-label="Info"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
        {open && (
          <div
            ref={popoverRef}
            className="absolute z-50 top-full mt-2 w-64 p-3 rounded-xl glass-card text-sm text-gray-600 leading-relaxed animate-scale-in"
            style={{ [dir === "rtl" ? "right" : "left"]: 0 }}
          >
            <div className="absolute -top-1.5 w-3 h-3 bg-white/80 rotate-45 border-t border-l border-white/30"
                 style={{ [dir === "rtl" ? "right" : "left"]: "12px" }} />
            {description}
          </div>
        )}
      </span>
    );
  }

  // Panel variant
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-cyan-500 hover:text-cyan-700 transition-colors group"
      >
        <Info className="w-3.5 h-3.5" />
        <span>{t("insight.learnMore" as any)}</span>
        {open ? (
          <ChevronUp className="w-3 h-3 transition-transform" />
        ) : (
          <ChevronDown className="w-3 h-3 transition-transform" />
        )}
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-lg bg-cyan-50/60 border border-cyan-100/50 text-xs text-gray-600 leading-relaxed animate-slide-down">
          {description}
        </div>
      )}
    </div>
  );
}
