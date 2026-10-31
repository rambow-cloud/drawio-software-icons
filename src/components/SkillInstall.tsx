import { useRef, useState } from 'react';
import { useIcons } from '../site';
import { CodePanel } from './CodePanel';
import { CopyButton } from './CopyButton';
import { ExternalLink } from './Ui';

const command = 'npx @rambowcloud/icons-skill';
const messages = {
  'zh-CN': {
    title: '让 AI 直接使用图标库',
    description: '为网页、应用界面、文档、演示和架构图选取图标。产品素材保留原色，通用图标取自 Tabler。',
    command: '在终端中安装 Skill', copy: '复制命令', copied: '已复制',
    fallback: '已选中命令，请按 Ctrl/Cmd+C 复制。',
    hint: '需要 Node.js 22.12+ · 运行后选择 agent 和安装位置', docs: '安装与使用说明',
  },
  en: {
    title: 'Give your AI agent the icon library',
    description: 'Source icons for websites, app interfaces, docs, slides and diagrams. Original-color product artwork, generic icons from Tabler.',
    command: 'Install the skill in your terminal', copy: 'Copy command', copied: 'Copied',
    fallback: 'Command selected. Press Ctrl/Cmd+C to copy.',
    hint: 'Node.js 22.12+ required · Choose agents and install location when prompted', docs: 'Installation and usage',
  },
};

export function SkillInstall() {
  const { locale } = useIcons(), t = messages[locale];
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState('');
  return <section className="skill-install" id="install-skill" aria-labelledby="skill-install-title">
    <div className="skill-install-intro">
      <p className="eyebrow">AGENT SKILL</p>
      <h2 id="skill-install-title">{t.title}</h2>
      <p>{t.description}</p>
      <p className="skill-install-agents">Codex · Claude Code · Cursor · Gemini CLI · GitHub Copilot · OpenCode</p>
    </div>
    <div className="skill-install-command">
      <CodePanel title={t.command} terminal value={command} fieldRef={fieldRef} id="skill-install-command"
        aria-label={t.command} readOnly rows={1} actions={<CopyButton value={command} fieldRef={fieldRef}
          label={t.copy} copiedLabel={t.copied} fallbackLabel={t.fallback} onStatus={setStatus}/>}/>
      <p className="skill-install-hint">{t.hint}</p>
      <ExternalLink href="https://github.com/rambow-cloud/drawio-software-icons/blob/main/skills/rambow-icons/README.md">{t.docs} ↗</ExternalLink>
      <span className="skill-install-status" role="status" aria-live="polite">{status}</span>
    </div>
  </section>;
}
