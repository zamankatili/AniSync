/**
 * Vercel serverless fonksiyonlarını tek dosyalık ESM paketlerine derler.
 *
 * Neden: bu proje Next.js değil ve Vercel bu kurulumda `api/` altındaki
 * TypeScript dosyalarının **göreli import'larını paketlemiyor** (canlıda
 * `FUNCTION_INVOCATION_FAILED`; `/api/games/123` ve `/api/og` bunu doğruladı).
 * Bu yüzden tek dosyada çalışan (self-contained) fonksiyonlar üretiyoruz:
 *
 *   server/api/**.ts  →  api/**.js   (esbuild, ESM, bağımlılıklar inline)
 *
 * Kaynaklar `server/api` altında tutulur; `api/` yalnızca üretilmiş
 * fonksiyonları içerir. `npm run build` bu adımı otomatik çalıştırır ve CI
 * `git diff --exit-code -- api` ile paketlerin bayatlamadığını doğrular.
 */
import { build } from 'esbuild';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'server', 'api');
const outputDir = path.join(root, 'api');

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const entries = walk(sourceDir).filter((file) => file.endsWith('.ts'));
if (entries.length === 0) {
  console.error('build-api: server/api altında fonksiyon bulunamadı');
  process.exit(1);
}

for (const entry of entries) {
  const relative = path.relative(sourceDir, entry).replace(/\\/g, '/');
  const output = path.join(outputDir, relative.replace(/\.ts$/, '.js'));

  await build({
    entryPoints: [entry],
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    // Paket bağımlılıkları Vercel'de npm ci ile kurulur; native/ büyük
    // paketleri gömmemek için dışarıda bırakıyoruz.
    packages: 'external',
    legalComments: 'none',
    logLevel: 'warning',
    define: {
      // Vite'a özgü env erişimi sunucu paketinde patlamasın.
      'import.meta.env.VITE_ADMIN_EMAILS': 'undefined',
    },
  });

  console.log(`build-api: ${relative} → api/${relative.replace(/\.ts$/, '.js')}`);
}
