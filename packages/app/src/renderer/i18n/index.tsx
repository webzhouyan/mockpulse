import React, { createContext, useContext, useState, useEffect } from 'react';
import { zh } from './locales/zh';
import { en } from './locales/en';

export type SupportedLocale = 'zh-CN' | 'en';

type LocaleType = typeof zh;

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: LocaleType;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh-CN',
  setLocale: () => {},
  t: zh
});

export const I18nProvider: React.FC<{
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
  onLocaleChange?: (locale: SupportedLocale) => void;
}> = ({ children, initialLocale = 'zh-CN', onLocaleChange }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    return (localStorage.getItem('mockpulse_locale') as SupportedLocale) || initialLocale;
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('mockpulse_locale', newLocale);
    onLocaleChange?.(newLocale);
  };

  const t = locale === 'en' ? en : zh;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

