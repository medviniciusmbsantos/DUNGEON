// Public files must follow the app's base path, including GitHub Pages subfolders.
export function assetUrl(path: string): string {
  if (/^(https?:|data:|blob:|\/\/)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`;
}
