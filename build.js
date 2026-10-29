const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');
const root = __dirname;
const dist = path.join(root, 'dist');
function escapeInlineScript(source) {
  return source.replace(/<\/script/gi, '<\\/script');
}

async function buildAll() {
  fs.mkdirSync(dist, { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(root, 'src/code.ts')],
    outfile: path.join(dist, 'code.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    sourcemap: true,
    target: ['es2019'],
  });

  const ui = await esbuild.build({
    entryPoints: [path.join(root, 'src/ui.ts')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    sourcemap: false,
    write: false,
    target: ['es2019'],
  });

  const html = fs.readFileSync(path.join(root, 'src/ui.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'src/ui.css'), 'utf8');
  const script = ui.outputFiles.find((file) => file.path.endsWith('.js')) || ui.outputFiles[0];
  if (!script) throw new Error('UI bundle was not produced.');
  const bundledHtml = html
    .replace('/*__COMPONENT_CONTRACT_EDITOR_CSS__*/', css)
    .replace('/*__COMPONENT_CONTRACT_EDITOR_JS__*/', escapeInlineScript(script.text));
  fs.writeFileSync(path.join(dist, 'ui.html'), bundledHtml);

  await esbuild.build({
    entryPoints: [path.join(root, 'src/core/index.ts')],
    outfile: path.join(dist, 'core.cjs'),
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: ['node18'],
  });

  console.log('ComponentContract Editor build complete.');
}

if (isWatch) {
  console.log('Watch mode rebuilds on explicit saves; run npm run build after HTML/CSS changes.');
  buildAll().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
} else {
  buildAll().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
