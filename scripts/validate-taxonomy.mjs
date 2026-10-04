import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const readPool = (fileName) => {
  const filePath = path.join(root, 'src', 'content', 'pools', fileName);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(parsed.values)) {
    throw new Error(`Taxonomy pool "${fileName}" must contain a "values" array.`);
  }

  return parsed.values.map((entry, index) => {
    if (!entry || typeof entry.name !== 'string') {
      throw new Error(`Taxonomy pool "${fileName}" has an invalid value at index ${index}.`);
    }

    return {
      name: entry.name.trim(),
      file: fileName,
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

const tags = readPool('tags.json');
const software = readPool('software.json');
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


const readFrontmatter = (filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  if (!source.startsWith('---')) return null;

  const end = source.indexOf('\n---', 3);
  if (end === -1) {
    throw new Error(`Invalid frontmatter in ${filePath}: missing closing ---.`);
  }

  return source.slice(4, end);
};

const readScalar = (frontmatter, key) => {
  const match = frontmatter.match(new RegExp(`^\\${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
};

const readList = (frontmatter, key) => {
  const match = frontmatter.match(
    new RegExp(`^\\${key}:\\s*\\n((?:\\s+-\\s+.*(?:\\n|$))*)`, 'm'),
  );

  if (!match) return [];

  return match[1]
    .split(/\\r?\\n/)
    .map((line) => line.match(/^\\s+-\\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean)
    .map((value) => value.replace(/^["']|["']$/g, ''));
};

const assertCanonicalContentValues = (filePath, pool, fields) => {
  const frontmatter = readFrontmatter(filePath);
  if (!frontmatter) return;

  for (const field of fields) {
    const values = field.type === 'list'
      ? readList(frontmatter, field.name)
      : [readScalar(frontmatter, field.name)].filter(Boolean);

    for (const value of values) {
      const key = normalize(value);
      const canonical = pool.get(key);

      if (!canonical) {
        throw new Error(
          `Unknown taxonomy value "${value}" in ${filePath} field "${field.name}". Use an existing canonical value from the appropriate Pool.`,
        );
      }

      if (canonical !== value) {
        throw new Error(
          `Non-canonical taxonomy value "${value}" in ${filePath} field "${field.name}". Use "${canonical}" instead.`,
        );
      }
    }
  }
};

const validateContentTaxonomy = (directory, pool, fields) => {
  const directoryPath = path.join(root, 'src', 'content', directory);

  for (const fileName of fs.readdirSync(directoryPath)) {
    if (!fileName.endsWith('.md')) continue;

    assertCanonicalContentValues(
      path.join(directoryPath, fileName),
      pool,
      fields,
    );
  }
};

const tagPool = new Map(tags.map((entry) => [normalize(entry.name), entry.name]));
const softwarePool = new Map(
  software.map((entry) => [normalize(entry.name), entry.name]),
);

validateContentTaxonomy('projects', tagPool, [
  { name: 'category', type: 'scalar' },
  { name: 'role', type: 'scalar' },
  { name: 'client', type: 'scalar' },
  { name: 'tags', type: 'list' },
]);

validateContentTaxonomy('projects', softwarePool, [
  { name: 'softwareUsed', type: 'list' },
]);

validateContentTaxonomy('learning', tagPool, [
  { name: 'tags', type: 'list' },
]);

validateContentTaxonomy('learning', softwarePool, [
  { name: 'softwareUsed', type: 'list' },
]);
