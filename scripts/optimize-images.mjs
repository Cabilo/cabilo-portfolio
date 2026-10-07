import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = path.join(root, 'public');

const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const CONCURRENCY = 4;
const WEBP_QUALITY = 98;
const WEBP_EFFORT = 6;

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

const files = await walk(publicDir);
let generated = 0;
let skipped = 0;
let savedBytes = 0;

const processFile = async (sourcePath) => {
  const outputPath = path.join(
    path.dirname(sourcePath),
    path.basename(sourcePath, path.extname(sourcePath)) + '.webp',
  );

  const sourceStat = await fs.stat(sourcePath);

  try {
    const outputStat = await fs.stat(outputPath);

    if (outputStat.mtimeMs >= sourceStat.mtimeMs) {
      skipped += 1;
      return;
    }
  } catch {
    // WebP does not exist yet.
  }

  const info = await sharp(sourcePath)
    .webp({
      quality: WEBP_QUALITY,
      effort: WEBP_EFFORT,
      smartSubsample: true,
    })
    .toFile(outputPath);

  if (info.size >= sourceStat.size) {
    await fs.rm(outputPath, { force: true });

    const relative = path.relative(root, sourcePath);
    console.log(
      `WebP: ${relative} kept original (${formatBytes(info.size)} candidate was not smaller)`,
    );
    return;
  }

  generated += 1;
  savedBytes += sourceStat.size - info.size;

  const relative = path.relative(root, sourcePath);
  const reduction = Math.round((1 - info.size / sourceStat.size) * 100);

  console.log(
    `WebP: ${relative} -> ${formatBytes(info.size)} (${reduction}% smaller)`,
  );
};

for (let index = 0; index < files.length; index += CONCURRENCY) {
  await Promise.all(files.slice(index, index + CONCURRENCY).map(processFile));
}

console.log(
  `WebP optimization complete: ${files.length} source images, ${generated} generated, ${skipped} already current, ${formatBytes(savedBytes)} estimated source-size savings.`,
);
