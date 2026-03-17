"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const STORAGE_KEY = "dialectiq-tutorial-completed";

interface TutorialStep {
  targetSelector: string;
  titleKey: string;
  descKey: string;
  position: "top" | "bottom";
}

const STEPS: TutorialStep[] = [
  {
    targetSelector: "[data-tutorial='stats-cards']",
    titleKey: "tutorial.step1Title",
    descKey: "tutorial.step1Desc",
    position: "bottom",
  },
  {
    targetSelector: "[data-tutorial='urgency-chart']",
    titleKey: "tutorial.step2Title",
    descKey: "tutorial.step2Desc",
    position: "bottom",
  },
  {
    targetSelector: "[data-tutorial='category-chart']",
    titleKey: "tutorial.step3Title",
    descKey: "tutorial.step3Desc",
    position: "bottom",
  },
  {
    targetSelector: "[data-tutorial='dialect-chart']",
    titleKey: "tutorial.step4Title",
    descKey: "tutorial.step4Desc",
    position: "bottom",
  },
  {
    targetSelector: "[data-tutorial='filter-bar']",
    titleKey: "tutorial.step5Title",
    descKey: "tutorial.step5Desc",
    position: "bottom",
  },
  {
    targetSelector: "[data-tutorial='reviews-section']",
    titleKey: "tutorial.step6Title",
    descKey: "tutorial.step6Desc",
    position: "top",
  },
];

export function useTutorial() {
  const [isActive, setIsActive] = useState(false);

  const startTutorial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsActive(true);
  }, []);

  const endTutorial = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsActive(false);
  }, []);

  // Auto-show on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay slightly so dashboard renders first
      const timer = setTimeout(() => setIsActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return { isActive, startTutorial, endTutorial };
}

interface TutorialOverlayProps {
  isActive: boolean;
  onEnd: () => void;
}

export default function TutorialOverlay({ isActive, onEnd }: TutorialOverlayProps) {
  const { t, dir } = useI18n();
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = STEPS[step];

  // Calculate target element position
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Small delay after scroll for rect to settle
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        }, 400);
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isActive, step, currentStep]);

  // Reset step on open
  useEffect(() => {
    if (isActive) setStep(0);
  }, [isActive]);

  if (!isActive || !currentStep) return null;

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onEnd();
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  // Spotlight clip path
  const pad = 12;
  const clipPath = targetRect
    ? `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${targetRect.left - pad}px ${targetRect.top - pad}px,
        ${targetRect.right + pad}px ${targetRect.top - pad}px,
        ${targetRect.right + pad}px ${targetRect.bottom + pad}px,
        ${targetRect.left - pad}px ${targetRect.bottom + pad}px,
        ${targetRect.left - pad}px ${targetRect.top - pad}px
      )`
    : undefined;

  // Tooltip positioning
  const tooltipStyle: React.CSSProperties = {};
  if (targetRect) {
    const centerX = targetRect.left + targetRect.width / 2;
    tooltipStyle.left = Math.max(16, Math.min(centerX - 160, window.innerWidth - 336));
    if (currentStep.position === "bottom") {
      tooltipStyle.top = targetRect.bottom + pad + 12;
    } else {
      tooltipStyle.bottom = window.innerHeight - targetRect.top + pad + 12;
    }
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] animate-fade-in" dir={dir}>
      {/* Backdrop with spotlight cutout */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          clipPath,
        }}
        onClick={onEnd}
      />

      {/* Spotlight border glow */}
      {targetRect && (
        <div
          className="absolute rounded-xl border-2 border-cyan-400/60 pointer-events-none transition-all duration-300"
          style={{
            left: targetRect.left - pad,
            top: targetRect.top - pad,
            width: targetRect.width + pad * 2,
            height: targetRect.height + pad * 2,
            boxShadow: "0 0 20px rgba(79,70,229,0.3)",
          }}
        />
      )}

      {/* Tooltip card */}
      {targetRect && (
        <div
          className="absolute w-80 p-5 rounded-2xl bg-white shadow-xl border border-gray-100 animate-scale-in"
          style={tooltipStyle}
        >
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-cyan-500 bg-cyan-50 px-2 py-0.5 rounded-full">
              {step + 1} / {STEPS.length}
            </span>
            <button onClick={onEnd} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-base font-bold text-gray-900 mb-1.5">
            {t(currentStep.titleKey as any)}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {t(currentStep.descKey as any)}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={onEnd}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t("tutorial.skip" as any)}
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <PrevIcon className="w-3 h-3" />
                  {t("tutorial.prev" as any)}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white gradient-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                {step < STEPS.length - 1 ? t("tutorial.next" as any) : t("tutorial.done" as any)}
                {step < STEPS.length - 1 && <NextIcon className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === step ? "bg-cyan-500 w-4" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
