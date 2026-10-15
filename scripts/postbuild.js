import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('[Postbuild] Verifying build artifacts in:', distDir);

if (!fs.existsSync(distDir)) {
  console.error('[Postbuild ERROR] dist directory does not exist!');
  process.exit(1);
}

const requiredFiles = ['index.html', 'server.js'];
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[Postbuild ERROR] Required artifact missing: ${file}`);
    process.exit(1);
  }
}

const files = fs.readdirSync(distDir);
console.log(`[Postbuild] Build artifacts verified (${files.length} items in dist: ${files.join(', ')})`);

// Check if running inside AI Studio or Cloud deployment environment
const isAiStudioOrCloud = Boolean(
  process.env.APPLET_ID ||
  process.env.APPLET_DIR ||
  process.env.CONTROL_PLANE_PORT ||
  process.env.K_SERVICE ||
  process.env.K_REVISION ||
  process.env.GAE_ENV ||
  process.env.CI
);

if (isAiStudioOrCloud) {
  console.log('[Postbuild] AI Studio / Cloud environment detected. Skipping desktop packaging aliases.');
}

// In AI Studio / Cloud Run, create a 'build' directory by deeply copying 'dist' so the artifact uploader finds it (no symlinks).
if (isAiStudioOrCloud) {
  console.log('[Postbuild] AI Studio / Cloud environment detected. Copying dist to build for artifact uploader.');
  for (const dirName of ['build']) {
    const targetDir = path.join(rootDir, dirName);
    try {
      const stats = fs.lstatSync(targetDir);
      if (stats.isSymbolicLink() || stats.isFile()) {
        fs.unlinkSync(targetDir);
      } else {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
    } catch {}
    try {
      fs.cpSync(distDir, targetDir, { recursive: true });
      console.log(`[Postbuild] Mirrored artifacts to ${dirName} for deployment runner.`);
    } catch (cpErr) {
      console.warn(`[Postbuild] Could not mirror to ${dirName}:`, cpErr.message);
    }
  }
} else {
  // Local desktop builds only
  const fallbackDirs = ['build', 'dist-electron'];
  for (const dirName of fallbackDirs) {
    const targetDir = path.join(rootDir, dirName);
    try {
      if (fs.existsSync(targetDir)) {
        const stats = fs.lstatSync(targetDir);
        if (stats.isSymbolicLink()) {
          fs.unlinkSync(targetDir);
        } else {
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
      }
      fs.symlinkSync('dist', targetDir, 'junction');
      console.log(`[Postbuild] Created artifact alias ${dirName} -> dist`);
    } catch (err) {
      try {
        fs.cpSync(distDir, targetDir, { recursive: true });
        console.log(`[Postbuild] Mirrored artifacts to ${dirName}`);
      } catch (cpErr) {
        console.warn(`[Postbuild] Could not mirror to ${dirName}:`, cpErr.message);
      }
    }
  }
}

console.log('[Postbuild] All artifact outputs ready.');
