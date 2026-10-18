import { useId } from 'react';
import { artworkDimensions, artworkFormat, previewBackgrounds } from '../icon-presentation.mjs';
import type { Icon } from '../types';
import type { Locale } from '../i18n';

export function ArtworkPreview({icon,locale,src,name,dark=false}:{icon:Icon;locale:Locale;src:string;name:string;dark?:boolean}) {
  const group=useId();
  const label=locale==='en'?'Preview background':'预览背景';
  return <figure className="artwork-preview">
    <div className="artwork-stage"><img src={src} alt={`${name} ${artworkFormat(icon)} ${locale==='en'?'icon':'图标'}`} width="180" height="180"/></div>
    <figcaption className="preview-controls">
      <div className="preview-backgrounds" role="group" aria-label={label}>
        <span aria-hidden="true">{label}</span>
        {previewBackgrounds(locale).map(choice=><label className="preview-choice" key={choice.value} title={choice.label}>
          <input type="radio" name={group} value={choice.value} aria-label={choice.label} defaultChecked={choice.value===(dark?'dark':'light')}/>
          <span className={`preview-swatch swatch-${choice.value}`} aria-hidden="true"/>
        </label>)}
      </div>
      <span className="preview-format">{artworkFormat(icon)}{artworkDimensions(icon)}</span>
    </figcaption>
  </figure>;
}
