import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="fixed top-3 right-3 z-50">
      <Select value={lang} onValueChange={(v) => setLang(v as any)}>
        <SelectTrigger className="h-8 w-[140px] bg-white/90">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="am">Amharic (አማርኛ)</SelectItem>
          <SelectItem value="wo">Wolaita</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
