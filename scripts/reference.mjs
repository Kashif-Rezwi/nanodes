// Generate local-only comparison assets from the reviewed source; never vendor brand paths.
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';

const portfolio = process.argv[2];
if (!portfolio) throw new Error('Usage: npm run reference -- /absolute/path/to/portfolio');
const source = resolve(portfolio);
const baseline = 'cb8d321297700866709cedb96fc1e8df362e8212';
// Read the committed baseline, independent of local edits or the checkout's current branch.
const readReference = (file) => execFileSync('git', ['show', baseline + ':' + file], { cwd: source, encoding: 'utf8' });
const contact = readReference('src/sections/Contact.astro');
const roles = readReference('src/lib/ascii-roles.ts');
const script = contact.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
const definitions = script.slice(script.indexOf('const techDefs = ') + 17, script.indexOf('    const COLS')).trim().replace(/;$/, '');
const items = runInNewContext('(' + definitions + ')');
const markup = contact.slice(contact.indexOf('      <div class="contact-ascii-element"'), contact.indexOf('    </div>\n  </div>\n</section>'));
const css = contact.slice(contact.indexOf('  .contact-ascii-element {'), contact.indexOf('  @media (max-width: 1100px)'));
const expose = '\nwindow.reference = { frames: techList, stopAutoCycle };\n';
const referenceScript = script.replace('  })();', expose + '  })();');
await mkdir('.reference', { recursive: true });
await writeFile('.reference/items.json', JSON.stringify(items));
await writeFile('.reference/contact.html', `<!doctype html><html><meta charset="utf-8"><link rel="stylesheet" href="/tests/fixture.css"><script src="/tests/clock.js"></script><style>${css}@media(max-width:480px){.contact-ascii-element{padding:0.75rem 0.25rem;min-height:240px;}}</style><body>${markup}<script>${referenceScript}</script></body></html>`);
// Keep the independent original text builder in an ignored module for comparison.
await writeFile('.reference/roles.js', roles.replace(/: Record<string, \[string, string\]>/g, '').replace(/: string\[\]/g, '').replace(/: string/g, '').replace(/\): \[string, string\]/g, ')').replace(/ as const/g, ''));
console.log('Generated 25 local reference items in .reference/ (ignored; not a distributable preset).');
