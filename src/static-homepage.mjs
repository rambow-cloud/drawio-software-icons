// Self-contained functions embedded by the build, without a module fetch.
export function homepageLocale() {
  let saved;
  try { saved = localStorage.getItem('icons-locale'); } catch { /* Storage is optional. */ }
  return saved === 'en' || saved === 'zh-CN' ? saved : navigator.language?.startsWith('zh') ? 'zh-CN' : 'en';
}

export function prepareHomepage() {
  const locale = document.documentElement.lang;
  const root = document.getElementById('app');
  const translated = document.getElementById('homepage-zh-CN');
  if (locale === 'zh-CN') root.replaceChildren(translated.content);
  root.dataset.locale = locale;
  root.removeAttribute('data-pending-locale');
  translated.remove();
}
