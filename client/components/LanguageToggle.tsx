import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const flagFor = (code: string) => {
  switch (code) {
    case "en":
      return "🇬🇧";
    case "am":
      return "🇪🇹";
    case "wo":
      return "🌍";
    default:
      return "🌐";
  }
};

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={className}>
      <Select value={lang} onValueChange={(v) => setLang(v as any)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">
            <div className="flex items-center gap-2">
              <span className="text-xl">{flagFor("en")}</span>
              <span>English (ENG)</span>
            </div>
          </SelectItem>
          <SelectItem value="am">
            <div className="flex items-center gap-2">
              <span className="text-xl">{flagFor("am")}</span>
              <span>Amharic (AMH)</span>
            </div>
          </SelectItem>
          <SelectItem value="wo">
            <div className="flex items-center gap-2">
              <span className="text-xl">{flagFor("wo")}</span>
              <span>Wolaita (WOL)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
