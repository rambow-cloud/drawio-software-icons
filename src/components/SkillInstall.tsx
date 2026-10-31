import { useRef, useState } from 'react';
import { useIcons } from '../site';
import { ArrowUpRight, Terminal } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { ExternalLink } from './Ui';

const command = 'npx @rambowcloud/icons-skill';
const messages = {
  'zh-CN': {
    title: '在 AI 中使用图标',
    command: '安装 Skill 的终端命令', copy: '复制安装命令', copied: '已复制',
    fallback: '已选中命令，请按 Ctrl/Cmd+C 复制。',
    agents: 'Codex、Claude Code、Cursor 等', hint: 'Node.js 22.12+', docs: '使用说明',
  },
  en: {
    title: 'Use icons with your AI agent',
    command: 'Terminal command to install the skill', copy: 'Copy install command', copied: 'Copied',
    fallback: 'Command selected. Press Ctrl/Cmd+C to copy.',
    agents: 'Codex, Claude Code, Cursor & more', hint: 'Node.js 22.12+', docs: 'Usage guide',
  },
};

export function SkillInstall() {
  const { locale } = useIcons(), t = messages[locale];
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState('');
  return <section className="skill-install" id="install-skill" aria-labelledby="skill-install-title">
    <div className="skill-install-heading">
      <h2 id="skill-install-title">{t.title}</h2>
      <ExternalLink href="https://github.com/rambow-cloud/drawio-software-icons/blob/main/skills/rambow-icons/README.md">{t.docs}<ArrowUpRight size={13} aria-hidden="true"/></ExternalLink>
    </div>
    <div className="skill-install-command">
      <Terminal size={15} aria-hidden="true"/>
      <textarea value={command} ref={fieldRef} id="skill-install-command" aria-label={t.command}
        readOnly rows={1} wrap="off" spellCheck={false}/>
      <CopyButton value={command} fieldRef={fieldRef} iconOnly
        label={t.copy} copiedLabel={t.copied} fallbackLabel={t.fallback} onStatus={setStatus}/>
    </div>
    <p className="skill-install-meta"><span>{t.agents}</span><span>{t.hint}</span></p>
    <span className="skill-install-status" role="status" aria-live="polite">{status}</span>
  </section>;
}
