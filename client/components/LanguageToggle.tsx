import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={className}>
      <Select value={lang} onValueChange={(v) => setLang(v as any)}>
        <SelectTrigger className="h-9 w-[170px] bg-white/90 shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="am">Amharic (አማርኛ)</SelectItem>
          <SelectItem value="wo">Wolaytatto (Wolaita)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
