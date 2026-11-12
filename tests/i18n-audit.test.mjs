import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const providerPath = path.join(process.cwd(), 'src/providers/i18n-provider.tsx');
const source = fs.readFileSync(providerPath, 'utf8');

test('default locale is Portuguese and required UI keys are translated', () => {
  assert.match(source, /useState<Locale>\("pt"\)/, 'default locale should be Portuguese');
  assert.match(source, /"nav\.help":\s*"Ajuda"/, 'nav.help should be translated');
  assert.match(source, /"nav\.menu":\s*"Menu"/, 'nav.menu should be translated');
  assert.match(source, /"nav\.getStarted":\s*"Começar"/, 'nav.getStarted should be translated');
  assert.match(source, /"dashboard\.sidebar\.search":\s*"Procurar tutores"/, 'dashboard.sidebar.search should be translated');
});

test('fallback does not expose raw translation keys to the UI', () => {
  assert.match(source, /"Text unavailable"/, 'English should use a professional missing-text fallback');
  assert.match(source, /"Texto indisponível"/, 'Portuguese should use a professional missing-text fallback');
  assert.doesNotMatch(source, /\?\?\s*key\b/, 'the active provider must never return the raw key');

  const legacyProvider = fs.readFileSync(
    path.join(process.cwd(), 'src/app/providers/index.tsx'),
    'utf8',
  );
  assert.doesNotMatch(legacyProvider, /\|\|\s*key\b/, 'the legacy provider must never return the raw key');
});

test('all literal UI translation calls exist in Portuguese and English', () => {
  const sourceRoot = path.join(process.cwd(), 'src');
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(filePath);
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(filePath);
    }
  };
  visit(sourceRoot);

  const usedKeys = new Set();
  for (const filePath of files) {
    const file = fs.readFileSync(filePath, 'utf8');
    for (const match of file.matchAll(/\bt\(\s*["']([^"']+)["']\s*\)/g)) {
      usedKeys.add(match[1]);
    }
  }

  const dictionaryStart = source.indexOf('const DICTS:');
  const dictionaryEnd = source.indexOf('\ntype I18nContextValue', dictionaryStart);
  const dictionaries = source.slice(dictionaryStart, dictionaryEnd);
  const ptStart = dictionaries.indexOf('  pt: {');
  const enStart = dictionaries.indexOf('  en: {');
  const amStart = dictionaries.indexOf('  am: {');
  const keysIn = (start, end) => new Set(
    [...dictionaries.slice(start, end).matchAll(/^\s*"([^"]+)"\s*:/gm)]
      .map((match) => match[1]),
  );
  const portugueseKeys = keysIn(ptStart, enStart);
  const englishKeys = keysIn(enStart, amStart);
  const missing = [...usedKeys].filter(
    (key) => !portugueseKeys.has(key) || !englishKeys.has(key),
  );

  assert.deepEqual(missing, [], 'every literal UI key must be translated in Portuguese and English');
});

test('mobile chat does not cover navigation or show unrelated legacy content', () => {
  const chat = fs.readFileSync(
    path.join(process.cwd(), 'src/app/_components/ChatWidget.tsx'),
    'utf8',
  );
  assert.match(chat, /bottom-28[^\"]*md:bottom-\[18px\]/, 'chat should sit above mobile navigation');
  assert.doesNotMatch(chat, /Eagle Tutorials|eagletutorials\.com/, 'chat must not show unrelated company information');
  assert.match(chat, /t\("chat\.greeting"\)/, 'chat greeting should use the translation provider');
});

test('dashboard role comes from the shared authenticated user', () => {
  const roleProvider = fs.readFileSync(
    path.join(process.cwd(), 'src/providers/role-provider.tsx'),
    'utf8',
  );
  assert.match(roleProvider, /useAuth\(\)/, 'role provider should reuse the active auth state');
  assert.doesNotMatch(roleProvider, /from\("profiles"\)/, 'dashboard role must not depend on the missing profiles lookup');
});
