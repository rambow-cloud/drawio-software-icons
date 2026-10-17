import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { messages } from './i18n';
import { file } from './site';
import './theme.css';

declare const __CATALOG_FILE__: string;

const root=document.getElementById('app')!;
const locale=root.dataset.locale==='zh-CN'?'zh-CN':'en';

// Keep the build-generated homepage visible, including when the catalog fails.
void (async()=>{
  try {
    const response=await fetch(file(__CATALOG_FILE__));
    if(!response.ok)throw Error(String(response.status));
    const catalog=await response.json();
    hydrateRoot(root,<App catalog={catalog} initialLocale={locale}/>);
  } catch(error) {
    console.error(error);
    const status=document.getElementById('startup-status')!;
    const retry=document.createElement('button');
    retry.type='button';retry.textContent=messages[locale].retry;
    retry.addEventListener('click',()=>location.reload());
    status.append(document.createTextNode(messages[locale].error+' '),retry);
    status.hidden=false;
  }
})();
