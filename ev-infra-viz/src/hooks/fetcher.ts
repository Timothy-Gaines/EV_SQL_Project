export const jsonFetcher = async (path: string) => {
  // Build absolute URL respecting Vite base in production while working in dev
  const base = import.meta.env.BASE_URL ?? '/'
  let url = path
  if (!/^https?:/.test(path)) {
    // ensure leading slash
    url = path.startsWith('/') ? path : `/${path}`
    url = `${base.replace(/\/$/, '')}${url}`
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }
  return res.json()
}