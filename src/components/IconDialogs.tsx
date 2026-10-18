import { Button, ButtonLink } from './ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { file, useIcons } from '../site';
import { searchSpotlight } from '../spotlight.mjs';
import { iconDetailUrl } from '../icon-guides.mjs';
import type { Icon } from '../types';
import { CloseButton, Dialog, ExternalLink, Symbol } from './Ui';
import { ArtworkPreview } from './ArtworkPreview';
import { artworkSource, projectLabel } from '../icon-presentation.mjs';

export function SpotlightDialog() {
  const s=useIcons(),{t,catalog,dark}=s;
  const [query,setQuery]=useState(''),[active,setActive]=useState(0),listRef=useRef<HTMLDivElement>(null);
  const results=useMemo(()=>searchSpotlight(catalog.icons,catalog.categories,query) as Icon[],[catalog,query]),matches=results.slice(0,40);
  useEffect(()=>{if(listRef.current)listRef.current.scrollTop=0;},[query]);
  useEffect(()=>{listRef.current?.querySelector(`#spotlight-option-${active}`)?.scrollIntoView({block:'nearest'});},[active]);
  return <Dialog id="spotlight" label={t.quickSearch} onClose={s.closeModal}>
    <div className="spotlight-search"><Symbol name="search"/><input id="spotlight-input" type="text" role="combobox" aria-label={t.quickSearch} aria-autocomplete="list" aria-expanded="true" aria-controls="spotlight-results" aria-describedby="spotlight-scope" aria-activedescendant={matches[active]?`spotlight-option-${active}`:undefined} placeholder={t.spotlightPlaceholder} autoComplete="off" spellCheck={false} data-dialog-autofocus value={query} onChange={event=>{setQuery(event.target.value);setActive(0);}} onKeyDown={event=>{
      if(event.nativeEvent.isComposing||event.keyCode===229)return;
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(matches.length)setActive(current=>(current+(event.key==='ArrowDown'?1:-1)+matches.length)%matches.length);}
      else if(event.key==='Enter'){event.preventDefault();if(matches[active])s.locateIcon(matches[active]);}
    }}/><Button variant="ghost" size="icon-sm" className="spotlight-close max-[760px]:size-11 min-[761px]:w-auto min-[761px]:px-3" onClick={s.closeModal} aria-label={t.close}><span className="min-[761px]:hidden"><Symbol name="close"/></span><kbd className="max-[760px]:hidden">Esc</kbd></Button></div>
    <p id="spotlight-scope" className="spotlight-scope">{t.spotlightScope}</p><div id="spotlight-results" role="listbox" aria-label={t.spotlightResults} ref={listRef}>{matches.map((icon,index)=><div key={icon.id} id={`spotlight-option-${index}`} className="spotlight-option" role="option" aria-selected={index===active} data-result={index} onMouseDown={event=>event.preventDefault()} onClick={()=>s.locateIcon(icon)}><span className={`spotlight-art${dark?' dark-preview':''}`}><img src={file(icon.asset)} width="32" height="32" alt=""/></span><span className="spotlight-label"><strong>{s.iconName(icon)}</strong><small>{s.title(catalog.categories.find(c=>c.id===icon.category)!)}</small></span><span className="spotlight-enter" aria-hidden="true">↵</span></div>)}</div>
    <p id="spotlight-status" className="spotlight-status" role="status" aria-live="polite">{results.length?`${results.length} ${t.results}${results.length>matches.length?` · ${t.spotlightLimit.replace('{count}',String(matches.length))}`:''}`:t.spotlightEmpty}</p><div className="spotlight-help"><span><kbd>↑</kbd><kbd>↓</kbd> {t.spotlightMove}</span><span><kbd>↵</kbd> {t.spotlightLocate}</span><span><kbd>Esc</kbd> {t.close}</span></div>
  </Dialog>;
}
export function DetailDialog({icon}:{icon:Icon}) {
  const s=useIcons(),{t,catalog,locale}=s,category=catalog.categories.find(c=>c.id===icon.category)!;
  return <Dialog id="detail" labelledBy="detail-title" onClose={s.closeModal}>
    <div className="detail-close-bar"><Button variant="ghost" size="icon" className="detail-close max-[760px]:size-11" onClick={s.closeModal} aria-label={t.close}><Symbol name="close"/></Button></div>
    <div className="detail-layout">
      <ArtworkPreview key={icon.id} icon={icon} locale={locale} src={file(icon.asset)} name={s.iconName(icon)}/>
      <div className="detail-content">
        <p className="detail-category">{s.title(category)}</p>
        <div className="detail-title-row"><h2 id="detail-title">{s.iconName(icon)}</h2><span className="detail-type">{s.typeLabel(icon.softwareType)}</span></div>
        <div className="detail-actions">
          <ButtonLink href={file(icon.asset)} download><Symbol name="download"/>{icon.asset.endsWith('.png')?t.downloadPng:t.downloadSvg}</ButtonLink>
          <ButtonLink variant="outline" className="shadow-none" href={file(category.libraries[locale])} download><Symbol name="download"/>{t.downloadLibrary}</ButtonLink>
        </div>
        <dl>
          <dt>{t.project}</dt><dd><ExternalLink href={icon.homepage}>{projectLabel(icon.homepage)} ↗</ExternalLink></dd>
          {icon.repository&&icon.repository!==icon.homepage&&<><dt>{t.repository}</dt><dd><ExternalLink href={icon.repository}>{projectLabel(icon.repository)} ↗</ExternalLink></dd></>}
          <dt>{t.source}</dt><dd><ExternalLink href={icon.source.listing??icon.source.url}>{artworkSource(icon,locale)} ↗</ExternalLink></dd>
          <dt>{icon.source.publisher?t.rightsNotice:t.license}</dt><dd><ExternalLink href={file(icon.source.licenseUrl)}>{icon.source.collectionLicense} ↗</ExternalLink></dd>
          <dt>{locale==='en'?'Names and aliases':'名称与别名'}</dt><dd>{[...new Set([icon.name,icon.nameEn,...icon.aliases].filter(Boolean))].join(', ')}</dd>
        </dl>
        <div className="detail-notes">
          <p>{t.brandNote}</p>
          {icon.softwareType==='commercial'&&<p>{t.commercialUse} <ExternalLink href={file('ICON_USAGE.md')}>{t.usagePolicy} ↗</ExternalLink></p>}
          <details><summary>{locale==='en'?'Usage notes and file verification':'使用说明与文件校验'}</summary>
            {icon.source.id==='official-apps'&&icon.source.variant!=='official-svg'&&<p>{t.officialRaster}</p>}
            <p>{t.typeNote}</p>
            <dl>{icon.source.publisher&&<><dt>{t.publisher}</dt><dd>{icon.source.publisher}</dd><dt>{t.sourceLink}</dt><dd><ExternalLink href={icon.source.url}>{icon.source.variant==='official-svg'?t.downloadSvg:t.downloadPng} ↗</ExternalLink></dd></>}
              <dt>{icon.source.publisher?t.contentPin:t.revision}</dt><dd><code>{icon.source.revision}</code></dd>
              {icon.sha256&&<><dt>SHA-256</dt><dd><code>{icon.sha256}</code></dd></>}
            </dl>
          </details>
        </div>
        <a className="detail-full-link" href={iconDetailUrl(locale,icon.id)}>{locale==='en'?'View full details':'查看完整详情'}<Symbol name="arrow"/></a>
      </div>
    </div>
  </Dialog>;
}
export function LocalNotice() {
  const {t,closeModal,setModal}=useIcons();
  return <Dialog id="notice" labelledBy="notice-title" onClose={closeModal}><CloseButton onClose={closeModal}/><h2 id="notice-title">{t.navGuide}</h2><p id="notice-body">{t.localNote}</p><Button variant="default" size="default" onClick={()=>setModal({kind:'bundle'})}>{t.bundle}</Button></Dialog>;
}
