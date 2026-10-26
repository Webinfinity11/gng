import { readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';

// Keep the source template's responsive rules intact without leaking its
// normalize/Webflow styles into the administrator interface.
const source = 'public/optik/assets/0d19a4f7c1-optik-template.webflow.shared.48ff2f660.css';
const css = postcss.parse(await readFile(source, 'utf8'));
css.walkRules(rule => {
  if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map(selector => {
    const scoped = selector.replace(/:root\b|\bhtml(?=[\s.#:[>+~]|$)|\bbody(?=[\s.#:[>+~]|$)/g, '.optik-site');
    return scoped.startsWith('.optik-site') ? scoped : `.optik-site ${scoped}`;
  });
});
await writeFile('src/app/optik-reference.css', `/* Source: user-supplied Optik reference. Regenerate with node scripts/scope-optik-css.mjs. */\n${css}`);
