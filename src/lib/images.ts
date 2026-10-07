/**
 * src/lib/images.ts
 *
 * Resolves local raster image URLs to their build-generated WebP versions.
 * Remote URLs and already-optimized WebP files are left untouched.
 */

export const getOptimizedImagePath = (src: string) => {
  if (!src || src.startsWith('//') || /^https?:\/\//i.test(src)) return src;

  const match = src.match(/^([^?#]*)([?#].*)?$/);
  if (!match) return src;

  const pathPart = match[1];
  const suffix = match[2] ?? '';

  if (!/\.(jpe?g|png)$/i.test(pathPart)) return src;

  return pathPart.replace(/\.(jpe?g|png)$/i, '.webp') + suffix;
};
