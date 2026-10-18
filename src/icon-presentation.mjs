// Presentation shared by the React quick preview and server-rendered detail page.
export const previewBackgrounds = locale => [
  { value: 'light', label: locale === 'en' ? 'Light background' : '浅色背景' },
  { value: 'dark', label: locale === 'en' ? 'Dark background' : '深色背景' },
  { value: 'transparent', label: locale === 'en' ? 'Transparency grid' : '透明背景' },
];

export const artworkFormat = icon => icon.asset.endsWith('.png') ? 'PNG' : 'SVG';
export const artworkDimensions = icon => icon.width && icon.height ? ` · ${icon.width} × ${icon.height}` : '';
export const artworkSource = (icon, locale) => icon.source.publisher || ({
  devicon: 'Devicon', dashboard: 'Dashboard Icons', lobe: 'Lobe Icons',
  vendor: 'Vendor Icons SVG', 'alibaba-iconfont': 'Alibaba Cloud · Iconfont',
  'official-apps': locale === 'en' ? 'Official publisher' : '官方发布者',
})[icon.source.id] || icon.source.id;

export const projectLabel = url => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname.replace(/\/$/, '')}`;
  } catch { return url; }
};
