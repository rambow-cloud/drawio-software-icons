// Shared by the initial HTML generator and the interactive homepage.
export const homepageTitle = '阿里云icon与软件图标库 | Alibaba Cloud Icons for draw.io';
export const homepageDescription = '阿里云icon、软件与 AI 架构图标库，提供 SVG 素材、draw.io XML 分类库、ZIP 下载及在线和离线导入说明。Alibaba Cloud and software icons for draw.io / diagrams.net.';
export const alibabaHeading = '阿里云icon 图标库 / Alibaba Cloud icons';

export function alibabaOverview(catalog) {
  const categories = catalog.categories.filter(category => category.collection === 'alibaba-cloud');
  const icons = catalog.icons.filter(icon => icon.collection === 'alibaba-cloud');
  const examples = [];
  const available = icons.filter(icon => categories.some(category => category.id === icon.category && !/orange|supplemental/.test(category.id)));
  for (const code of ['ecs', 'slb', 'oss', 'vpc']) {
    const icon = available.find(icon => new RegExp(`\\b${code}\\b`, 'i').test([icon.name, icon.nameEn, ...(icon.aliases || [])].join(' ')));
    if (icon && !examples.includes(icon)) examples.push(icon);
  }
  for (const category of categories) {
    if (examples.length >= 6) break;
    const icon = available.find(icon => icon.category === category.id && !examples.includes(icon));
    if (icon) examples.push(icon);
  }
  return {
    categories, examples, count: icons.length,
    chinese: `用于 draw.io / diagrams.net 云架构图的阿里云icon，包含 ${icons.length} 个图标条目、${categories.length} 个分类。按服务名称预览原色素材，下载 SVG、XML 或 ZIP，也可直接在线加载。条目包含颜色变体和补充图形，数量不代表独立云产品数量。`,
    english: `${icons.length} Alibaba Cloud icon entries in ${categories.length} categories for draw.io / diagrams.net. Preview source-color artwork, download SVG, XML or ZIP files, or load category libraries online. Entries include color variants and supplemental graphics, not distinct cloud products.`,
  };
}

export const alibabaCopy = {
  'zh-CN': {
    download: '下载阿里云图标 ZIP（SVG + XML）', xml: '下载阿里云全部图标 XML', online: '在 draw.io 加载阿里云分类',
    browse: '浏览全部阿里云图标', category: '分类与图标预览', source: '素材来源',
    steps: [
      ['在线绘图', '加载阿里云分类后，将左侧图库中的服务图标拖入画布，添加自己的连线和说明。分类 XML 已内嵌图像，无需逐个上传 SVG。'],
      ['桌面版与离线导入', '下载阿里云 ZIP，解压后将 drawio/ 目录中的分类 XML 拖到 draw.io 桌面版空白画布，或使用“文件 → 打开库”。'],
      ['SVG 与 XML 如何选择', 'SVG 是单个图标素材；分类 XML 在 draw.io 中保留独立面板；全部图标 XML 显示一个面板。需要保留已有桌面配置时，使用上方“选择分类加载 / 桌面配置”。'],
    ],
    rights: '独立社区整理，非阿里云官方站点。素材来源可逐项查看；商业图标仅供 draw.io 架构图绘制，上游许可及品牌权利仍然适用。',
  },
  en: {
    download: 'Download Alibaba Cloud ZIP (SVG + XML)', xml: 'Download all Alibaba Cloud icons as XML', online: 'Load Alibaba Cloud categories in draw.io',
    browse: 'Browse all Alibaba Cloud icons', category: 'Categories and icon previews', source: 'Artwork source',
    steps: [
      ['Online diagrams', 'Load the Alibaba Cloud categories, drag service icons from the library onto your canvas, and add your own connections and labels. Category XML embeds the images.'],
      ['Desktop and offline imports', 'Download and unzip the Alibaba Cloud ZIP. Drag category XML files from drawio/ onto a blank draw.io Desktop canvas, or use File → Open Library.'],
      ['Choosing SVG or XML', 'SVG is individual artwork. Category XML keeps separate draw.io panels; the all-icons XML creates one panel. Use “Choose categories / desktop setup” above to preserve an existing desktop configuration.'],
    ],
    rights: 'Independent community collection, not an official Alibaba Cloud site. Each preview links to its artwork source. Commercial artwork is for draw.io architecture diagrams; upstream licenses and brand rights apply.',
  },
};
