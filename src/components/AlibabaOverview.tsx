import { alibabaHeading, alibabaOverview, alibabaCopy } from '../homepage.mjs';
import { file, useIcons } from '../site';
import { Button, ButtonLink } from './ui/button';
import { LibraryLink } from './Ui';
import type { Category, Icon } from '../types';

export function AlibabaOverview() {
  const s=useIcons(),overview=alibabaOverview(s.catalog),t=alibabaCopy[s.locale];
  if(!overview.categories.length)return null;
  return <section className="alibaba-overview" id="alibaba-cloud" aria-labelledby="alibaba-heading">
    <h2 id="alibaba-heading">{alibabaHeading}</h2>
    <p lang="zh-CN">{overview.chinese}</p><p lang="en">{overview.english}</p>
    <div className="alibaba-downloads">
      <ButtonLink variant="outline" size="default" href={file('alibaba-cloud-drawio.zip')} download>{t.download}</ButtonLink>
      <ButtonLink variant="outline" size="default" href={file('drawio/all-icons.xml')} download>{t.xml}</ButtonLink>
      <LibraryLink categories={overview.categories}>{t.online}</LibraryLink>
      <a href="#library" onClick={()=>s.selectCollection('alibaba-cloud',true)}>{t.browse}</a>
    </div>
    <div className="alibaba-previews">{overview.examples.map((icon:Icon)=><article key={icon.id}>
      <Button variant="ghost" size="layout" className="flex-col" onClick={()=>s.locateIcon(icon)}><img src={file(icon.asset)} alt={icon.name} loading="lazy" width="64" height="64"/><span>{s.iconName(icon)}</span></Button>
      <p><a href={file(icon.asset)} download>SVG</a> · <a href={icon.source.url} target="_blank" rel="noopener noreferrer">{t.source}</a></p>
    </article>)}</div>
    <h3>{t.category}</h3>
    <ul className="alibaba-categories">{overview.categories.map((category:Category)=><li key={category.id}>
      <a href={file(`discover/${s.locale}/alibaba-cloud/${category.id}/`)}>{s.locale==='en'?category.nameEn:category.name} ({category.count})</a> · <a href={file(category.libraries[s.locale])} download>XML</a>
    </li>)}</ul>
    <div className="alibaba-imports">{t.steps.map(([heading,detail])=><article key={heading}><h3>{heading}</h3><p>{detail}</p></article>)}</div>
    <p className="alibaba-rights">{t.rights} <a href={file('compat/alibaba-cloud/NOTICE.md')}>{s.t.notices}</a></p>
  </section>;
}
