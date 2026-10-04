// src/lib/taxonomy.ts

export type TaxonomyKind = 'tag' | 'software';

export const normalizeTaxonomyValue = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export const slugifyTaxonomyValue = (value: string) =>
  normalizeTaxonomyValue(value)
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const valuesMatch = (left: string, right: string) =>
  normalizeTaxonomyValue(left) === normalizeTaxonomyValue(right);

export const validateTaxonomyPools = (
  tags: string[],
  software: string[],
) => {
  const tagMap = new Map<string, string>();
  const softwareMap = new Map<string, string>();

  for (const value of tags) {
    const key = normalizeTaxonomyValue(value);
    if (!key) throw new Error('Tag Pool contains an empty value.');
    if (tagMap.has(key)) {
      throw new Error(
        `Tag Pool contains a duplicate canonical value: "${value}". Existing value: "${tagMap.get(key)}".`,
      );
    }
    tagMap.set(key, value);
  }

  for (const value of software) {
    const key = normalizeTaxonomyValue(value);
    if (!key) throw new Error('Software Pool contains an empty value.');
    if (softwareMap.has(key)) {
      throw new Error(
        `Software Pool contains a duplicate canonical value: "${value}". Existing value: "${softwareMap.get(key)}".`,
      );
    }
    if (tagMap.has(key)) {
      throw new Error(
        `Taxonomy collision: "${value}" exists in both the Tag Pool and Software Pool. A canonical name may exist in only one pool.`,
      );
    }
    softwareMap.set(key, value);
  }

  return { tagMap, softwareMap };
};

export const assertCanonicalValue = (
  value: string,
  pool: Map<string, string>,
  kind: TaxonomyKind,
) => {
  const canonical = pool.get(normalizeTaxonomyValue(value));

  if (!canonical) {
    throw new Error(
      `Unknown ${kind} value "${value}". Use an existing canonical value from the ${kind === 'tag' ? 'Tag' : 'Software'} Pool.`,
    );
  }

  if (canonical !== value) {
    throw new Error(
      `Non-canonical ${kind} value "${value}". Use "${canonical}" instead.`,
    );
  }

  return canonical;
};
