// Temporary: checks whether the hosting build runs post-build steps and serves nested index.html files.
import { mkdirSync, writeFileSync } from 'fs';
mkdirSync('dist/build-probe', { recursive: true });
writeFileSync('dist/build-probe/index.html', `<!doctype html><title>probe</title><p>postbuild-ran ${new Date().toISOString()}</p>`);
