import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const readPool = (folder) => {
  const directory = path.join(root, 'src', 'content', folder);
  const files = fs.existsSync(directory)
    ? fs.readdirSync(directory).filter((file) => file.endsWith('.md'))
    : [];

  return files.map((file) => {
    const content = fs.readFileSync(path.join(directory, file), 'utf8');
    const match = content.match(/^name:\s*(.+)$/m);

    if (!match) {
      throw new Error(`Taxonomy entry "${folder}/${file}" is missing a canonical "name".`);
    }

    return {
      name: match[1].trim(),
      file: path.join(folder, file),
    };
  });
};

const normalize = (value) =>
  value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const levenshtein = (left, right) => {
  const previous = Array.from({ length: right.length + 1 }, (_, i) => i);

  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];

    for (let j = 1; j <= right.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
};

const similarity = (left, right) => {
  if (left === right) return 1;
  const longest = Math.max(left.length, right.length);
  return longest === 0 ? 1 : 1 - levenshtein(left, right) / longest;
};

const tags = readPool('tags');
const software = readPool('software');
const all = [
  ...tags.map((entry) => ({ ...entry, pool: 'Tag Pool' })),
  ...software.map((entry) => ({ ...entry, pool: 'Software Pool' })),
];

const seen = new Map();

for (const entry of all) {
  const key = normalize(entry.name);

  if (!key) {
    throw new Error(`Empty canonical value in ${entry.file}.`);
  }

  if (seen.has(key)) {
    const existing = seen.get(key);
    throw new Error(
      `Duplicate canonical value "${entry.name}" in ${entry.pool} (${entry.file}). It already exists in ${existing.pool} (${existing.file}). Use the existing canonical value instead.`,
    );
  }

  seen.set(key, entry);
}

for (let i = 0; i < all.length; i += 1) {
  for (let j = i + 1; j < all.length; j += 1) {
    const left = normalize(all[i].name);
    const right = normalize(all[j].name);

    if (left.length < 5 || right.length < 5) continue;

    const score = similarity(left, right);

    if (score >= 0.86) {
      throw new Error(
        `Canonical values "${all[i].name}" (${all[i].pool}) and "${all[j].name}" (${all[j].pool}) are too similar (similarity ${score.toFixed(2)}). Keep one canonical value and reference it instead of creating a duplicate.`,
      );
    }
  }
}

console.log(`Taxonomy validation passed: ${tags.length} tags, ${software.length} software values.`);
