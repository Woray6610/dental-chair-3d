import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = dirname(fileURLToPath(import.meta.url));
const { build } = require('esbuild');

await build({
  absWorkingDir: root,
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  target: ['chrome113', 'safari17', 'firefox120'],
  format: 'iife',
  outfile: 'dist/viewer.js',
  nodePaths: (process.env.NODE_PATH ?? '').split(process.platform === 'win32' ? ';' : ':').filter(Boolean),
  legalComments: 'eof',
});

mkdirSync(join(root, 'dist'), { recursive: true });
copyFileSync(join(dirname(require.resolve('three')), '..', 'LICENSE'), join(root, 'dist', 'three-LICENSE.txt'));
