import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  function setLang(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  }

  return (
    <div className="lang-switch">
      <button className={i18n.language === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
        {t('english')}
      </button>
      <button className={i18n.language.startsWith('hi') ? 'active' : ''} onClick={() => setLang('hi')}>
        {t('hindi')}
      </button>
    </div>
  );
}
