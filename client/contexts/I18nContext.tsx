import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'am' | 'wo';

type Dict = Record<string, string>;

type I18nContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Lang, Dict> = {
  en: {
    'app.title': 'Crime Management System',
    'city.name': 'Wolaita Sodo City',
    'login.accessSystem': 'Login / Access System',
    'hero.leadingBadge': "Ethiopia's Leading Crime Management Platform",
    'hero.welcome': 'Welcome to',
    'hero.securePortal': 'Access Secure Portal',
    'hero.emergency': 'Emergency: 911',
    'trust.iso': 'ISO Certified',
    'trust.encryption': '256-bit Encryption',
    'trust.support': '24/7 Support',
    'features.platformTitle': 'Comprehensive Crime Management Platform',
    'features.platformDesc': 'Cutting-edge technology meets law enforcement expertise. Our platform provides all the tools necessary for effective crime prevention, investigation, and community safety.',
    'roles.designedFor': 'Designed for Every User',
    'roles.designedForDesc': 'Role-based access ensures each user gets the tools they need while maintaining security.',
    'testimonials.heading': 'Trusted by Law Enforcement',
    'testimonials.subheading': 'See what our users say about the system',
    'cta.badge': 'Secure Access Portal',
    'cta.heading': 'Ready to Make Wolaita Sodo Safer?',
    'cta.subheading': 'Join our mission for community safety. Access our secure system to manage cases, file reports, monitor activities, and contribute to a safer city.',
    'cta.enterPortal': 'Enter Secure Portal',
    'cta.learnMore': 'Learn More',
    'footer.dept': 'Wolaita Sodo City Police Department',
    'footer.emergency': 'Emergency: 911',
    'footer.location': 'Wolaita Sodo, Ethiopia',
    'footer.copyright': '© 2024 Wolaita Sodo City Crime Management System. All rights reserved.',

    'login.accessLevel': 'Access Level',
    'login.selectRole': 'Select your role',
    'login.username': 'Username',
    'login.usernamePlaceholder': 'Enter your username',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Enter your password',
    'login.secureLogin': 'Secure Login',
    'login.authenticating': 'Authenticating...',
    'login.errorFillFields': 'Please fill in all fields',
    'login.invalidCredentials': 'Invalid credentials',
    'login.portalTitle': 'Crime Management System',
    'login.portalSubtitle': 'Wolaita Sodo City Security Portal',
    'login.emergencyContact': 'Emergency Contact: 911',
  },
  am: {
    'app.title': 'የወንጀል አስተዳደር ስርዓት',
    'city.name': 'ወላይታ ሶዶ ከተማ',
    'login.accessSystem': 'መግባት / ስርዓቱን መድረስ',
    'hero.leadingBadge': 'የኢትዮጵያ ከፍተኛ የወንጀል አስተዳደር መድረክ',
    'hero.welcome': 'እንኳን በደህና መጡ',
    'hero.securePortal': 'ወደ ደህንነቱ የተጠበቀ ፖርታል ግባ',
    'hero.emergency': 'አደጋ: 911',
    'trust.iso': 'የISO ማረጋገጫ',
    'trust.encryption': '256-ቢት ማስደበቂያ',
    'trust.support': '24/7 ድጋፍ',
    'features.platformTitle': 'አጠቃላይ የወንጀል አስተዳደር መድረክ',
    'features.platformDesc': 'የቴክኖሎጂ አዳዲስ ሀሳቦች ከየእለቱ ሕግ አስከባሪ ልምድ ጋር ይገናኛሉ። ለወንጀል መከላከያ፣ ምርመራ እና የማህበረሰብ ደህንነት ሁሉን አቀፍ መሣሪያዎችን እናቀርባለን።',
    'roles.designedFor': 'ለሁሉም ተጠቃሚ የተዘጋጀ',
    'roles.designedForDesc': 'በሚና መሰረት የሚመደብ መዳረሻ የእያንዳንዱን ፍላጎት ሳይጎድል ደህንነትን ይጠብቃል።',
    'testimonials.heading': 'በሕግ አስከባሪዎች የተታመነ',
    'testimonials.subheading': 'ስርዓቱ ስለምን እንደሚያስደንቅ ይህን ይካሄዱ',
    'cta.badge': 'የደህንነት መዳረሻ ፖርታል',
    'cta.heading': 'ወላይታ ሶዶን የበለጠ አስተማማኝ ለማድረግ ዝግጁ ነዎት?',
    'cta.subheading': 'ለማህበረሰብ ደህንነት ተቀላቀሉ። ጉዳዮችን ያስተዳድሩ፣ ሪፖርቶችን ያስገቡ እና እንቅስቃሴዎችን ይከታተሉ።',
    'cta.enterPortal': 'ወደ ፖርታሉ ግባ',
    'cta.learnMore': 'ተጨማሪ ይወቁ',
    'footer.dept': 'የወላይታ ሶዶ ከተማ ፖሊስ መምሪያ',
    'footer.emergency': 'አደጋ: 911',
    'footer.location': 'ወላይታ ሶዶ፣ ኢትዮጵያ',
    'footer.copyright': '© 2024 የወላይታ ሶዶ ከተማ የወንጀል አስተዳደር ስርዓት። መብቱ ተጠብቆ ይጠበቃል።',

    'login.accessLevel': 'የመዳረሻ ደረጃ',
    'login.selectRole': 'ሚናዎን ይምረጡ',
    'login.username': 'የተጠቃሚ ስም',
    'login.usernamePlaceholder': 'የተጠቃሚ ስምዎን ያስገቡ',
    'login.password': 'የሚስጥር ቁልፍ',
    'login.passwordPlaceholder': 'የሚስጥር ቁልፍዎን ያስገቡ',
    'login.secureLogin': 'ደህንነታዊ መግቢያ',
    'login.authenticating': 'በማረጋገጥ ላይ...',
    'login.errorFillFields': 'እባክዎ ሁሉንም መስኮች ይሙሉ',
    'login.invalidCredentials': 'የተሳሳተ መረጃ',
    'login.portalTitle': 'የወንጀል አስተዳደር ስርዓት',
    'login.portalSubtitle': 'የወላይታ ሶዶ ከተማ የደህንነት ፖርታል',
    'login.emergencyContact': 'የአደጋ መደወያ: 911',
  },
  wo: {
    // Wolaytatto (Wolaita) – provisional set; extends Amharic where needed
    'app.title': 'Wolaytta Xoossa Qeyyanna Shishsha',
    'city.name': 'Wolaytta Soodo Gaama',
    'login.accessSystem': 'Qillaa / Shishsha Gaamanchuwaa',
    'hero.leadingBadge': 'Itiyoophiya Heezzo Qeyyanna Shishsha Maadda',
    'hero.welcome': 'Aykaashsha!',
    'hero.securePortal': 'Shishsha Gaamanchuwaa Eqqa',
    'hero.emergency': 'Aycce: 911',
    'trust.iso': 'ISO Moosettida',
    'trust.encryption': '256-bit Qomishsha',
    'trust.support': '24/7 Qolanchuwi',
    'features.platformTitle': 'Baalaa Qeyyanna Shishsha Maadda',
    'features.platformDesc': 'Tekinoloojitti haaroi, heezzoassi azazanchuwassi gakkana. Qeyyanna woyyadanai, wossanchuwaa, kaaccuwaa qoppeessuwan baalaa ubbai berdiya.',
    'roles.designedFor': 'Hakkane Dargaassi Dargaassi Gaamanko',
    'roles.designedForDesc': 'Heezzo miishshai wogaassi gaamankuwaa erissi, shishshi wottido.',
    'testimonials.heading': 'Heezzoassi Moosettida',
    'testimonials.subheading': 'Shishshai ha ikkidoshshi, hee azeessite',
    'cta.badge': 'Shishsha Gaamanchuwaa',
    'cta.heading': 'Wolaytta Soodo Amanuwaa Woyyadanai? ',
    'cta.subheading': 'Amanuwaa woyyadanai koyyite. Shishsha gaamanchuwaassi case taaxxissuwaa, report qophissuwaa, woyyadanai qoppeessu.',
    'cta.enterPortal': 'Gaamanchuwaa Eqqa',
    'cta.learnMore': 'Roore Be’o',
    'footer.dept': 'Wolaytta Soodo Gaama Heezzoassi Biroo',
    'footer.emergency': 'Aycce: 911',
    'footer.location': 'Wolaytta Soodo, Itiyoophiya',
    'footer.copyright': '© 2024 Wolaytta Soodo Gaama Qeyyanna Shishsha. Ubbai Qaxxishshido.',

    'login.accessLevel': 'Gaamanchuwaa Minji',
    'login.selectRole': 'Miishsha Doorate',
    'login.username': 'Usuura Sunta',
    'login.usernamePlaceholder': 'Usuura sunta eyyada',
    'login.password': 'Qulfettaa',
    'login.passwordPlaceholder': 'Qulfettaa eyyada',
    'login.secureLogin': 'Shishshi Eqqa',
    'login.authenticating': 'Nabbabbancho…',
    'login.errorFillFields': 'Ubbai borchanchuwaa wo’ete',
    'login.invalidCredentials': 'Qaxxishshida yanna',
    'login.portalTitle': 'Qeyyanna Shishsha',
    'login.portalSubtitle': 'Wolaytta Soodo Gaama Shishsha Gaamanchuwaa',
    'login.emergencyContact': 'Aycce Qaxxishshi: 911',
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const dict = translations[lang] || translations.en;

  const t = (key: string, fallback?: string) => {
    const v = dict[key] ?? translations.en[key];
    return v ?? (fallback ?? key);
  };

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
