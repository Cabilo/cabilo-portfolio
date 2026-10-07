export const LOCALES = ['en', 'pt-br'] as const;
export type Locale = (typeof LOCALES)[number];

export const getLocaleFromId = (id: string): Locale =>
  id.startsWith('pt-br/') ? 'pt-br' : 'en';

export const getLocalizedId = (id: string) => {
  if (id.startsWith('pt-br/')) return id.slice('pt-br/'.length);
  if (id.startsWith('en/')) return id.slice('en/'.length);
  return id;
};

export const getLocalePrefix = (locale: Locale) =>
  locale === 'pt-br' ? '/pt-br' : '';

export const getLocalizedPath = (locale: Locale, path = '') => {
  const cleanPath = path.replace(/^\/+/, '');
  const prefix = getLocalePrefix(locale);
  return cleanPath ? `${prefix}/${cleanPath}` : `${prefix}/`;
};

export const getLocalizedEntry = async <T extends 'pages' | 'projects' | 'learning'>(
  getCollection: (collection: T) => Promise<any[]>,
  collection: T,
  locale: Locale,
  slug: string,
) => {
  const entries = await getCollection(collection);
  return entries.find(
    (entry) =>
      getLocaleFromId(entry.id) === locale &&
      getLocalizedId(entry.id) === slug,
  );
};
