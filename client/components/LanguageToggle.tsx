import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { en: "ENG", wo: "WOL", am: "AMH" };
const ORDER = ["en", "wo", "am"];

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={cn("inline-flex items-center rounded-full bg-white/90 shadow-sm overflow-hidden text-sm", className)}>
      {ORDER.map((code, idx) => {
        const active = lang === code;
        return (
          <React.Fragment key={code}>
            <button
              aria-label={`Set language ${LABELS[code]}`}
              onClick={() => setLang(code as any)}
              className={cn(
                "px-3 py-2 font-semibold leading-none focus:outline-none",
                active ? "bg-crime-red text-white" : "text-gray-700 hover:bg-gray-100",
              )}
              type="button"
            >
              {LABELS[code]}
            </button>
            {idx < ORDER.length - 1 && (
              <span className="px-1 text-xs text-gray-400 select-none">&lt;</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
