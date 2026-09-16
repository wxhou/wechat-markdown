/**
 * Test harness for the verbatim AGPL renderer scripts in public/.
 *
 * These files are UMD modules written for the browser: they attach to
 * `window`, reach for `window.marked`, and converter.parse needs a DOM
 * (DOMParser). Under Node we load them through a scoped CJS shim with a
 * jsdom-backed global surface — no source is modified (verbatim 移植约束).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public');

let dom: JSDOM | null = null;

function ensureDom() {
  if (dom) return;
  dom = new JSDOM('');
  // Seed only what the renderer scripts genuinely touch; converter.js walks
  // parsed DOM nodes, themes.js builds section/span trees.
  for (const key of ['window', 'document', 'DOMParser', 'Node', 'NodeFilter', 'HTMLElement', 'Element']) {
    const value = (dom.window as unknown as Record<string, unknown>)[key];
    if (value !== undefined) (globalThis as Record<string, unknown>)[key] = value;
  }
}

type ModuleMap = Record<string, { exports: Record<string, unknown> }>;

function loadPublicModule(name: string): Record<string, unknown> {
  ensureDom();
  // Each call builds a fresh module graph so tests never share mutable state.
  const registry: ModuleMap = {};
  const requireFromPublic = (spec: string): Record<string, unknown> => {
    const resolved = registry[spec];
    if (resolved) return resolved.exports;
    const file = path.resolve(PUBLIC_DIR, spec.endsWith('.js') ? spec : `${spec}.js`);
    const source = readFileSync(file, 'utf8');
    const mod = { exports: {} as Record<string, unknown> };
    registry[spec] = mod;
    const wrapper = vm.runInThisContext(
      `(function (exports, require, module, __filename, __dirname) {${source}\n});`,
      { filename: file },
    );
    wrapper(mod.exports, requireFromPublic, mod, file, path.dirname(file));
    return mod.exports;
  };
  return requireFromPublic(`./${name}.js`);
}

type Converter = {
  parse: (md: string) => Array<{ type: string } & Record<string, unknown>>;
  plainText: (md: string) => string;
};
type ThemeSpec = { id: string; name: string; group: string };
type Themes = { SPECS: ThemeSpec[]; GROUPS: Array<{ id: string; name: string }>; LIBRARIES: Array<{ id: string; groups: string[] }>; getSpec: (id: string) => ThemeSpec; render: (tokens: unknown[], spec: ThemeSpec, opt: { author: string }) => string };
type Validator = { validate: (html: string) => { ok: boolean; errors: string[]; warnings: string[] } };

export function loadConverter(): Converter {
  return loadPublicModule('converter') as unknown as Converter;
}
export function loadThemes(): Themes {
  return loadPublicModule('themes') as unknown as Themes;
}
export function loadValidator(): Validator {
  return loadPublicModule('validator') as unknown as Validator;
}