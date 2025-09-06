import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const { lang, setLang } = useI18n();

  return (
    <div className={className}>
      <Select value={lang} onValueChange={(v) => setLang(v as any)}>
        <SelectTrigger className="w-20 px-2 py-1 text-sm rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">ENG</SelectItem>
          <SelectItem value="wo">WOL</SelectItem>
          <SelectItem value="am">AMH</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
