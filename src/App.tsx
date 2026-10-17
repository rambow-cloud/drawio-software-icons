import { useState } from 'react';
import type { Locale } from './i18n';
import type { Catalog } from './types';
import { SiteProvider, useIcons } from './site';
import { Header, Home, GuideAndSources, Footer } from './components/Home';
import { Changelog } from './components/Updates';
import { IconLibrary } from './components/IconLibrary';
import { DetailDialog, LocalNotice, SpotlightDialog } from './components/IconDialogs';
import { BundleDialog } from './components/BundleDialog';
import { McpDialog } from './components/McpDialog';

export function Page() {
  const {modal}=useIcons();
  return <><Header/><main><Home/><IconLibrary/><Changelog/><GuideAndSources/></main><Footer/>
    {modal?.kind==='spotlight'&&<SpotlightDialog/>}
    {modal?.kind==='detail'&&<DetailDialog icon={modal.icon}/>}
    {modal?.kind==='bundle'&&<BundleDialog/>}
    {modal?.kind==='mcp'&&<McpDialog/>}
    {modal?.kind==='notice'&&<LocalNotice/>}
  </>;
}
export default function App({catalog,initialLocale}:{catalog:Catalog;initialLocale:Locale}) {
  const [locale,setLocale]=useState(initialLocale);
  return <SiteProvider catalog={catalog} locale={locale} setLocale={setLocale} prerendered><Page/></SiteProvider>;
}
