export const jsonFetcher = async (path: string) => {
  // Build absolute URL respecting Vite base in production while working in dev
  const base = import.meta.env.DEV ? '' : import.meta.env.BASE_URL ?? '/'
  let url = path
  // prepend base only for relative paths
  if (!/^https?:/.test(path)) {
    url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }
  return res.json()
} 