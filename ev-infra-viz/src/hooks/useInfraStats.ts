import useSWR from 'swr'

export interface InfraStats {
  year: number
  totalStations: number
  dcFastStations: number
  statesCovered: number
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

// access base url for correct asset path handling
const { BASE_URL } = (import.meta as unknown as { env: { BASE_URL: string } }).env
const basePath = BASE_URL || '/'

export const useInfraStats = () => {
  const swr = useSWR<InfraStats>(`${basePath}data/infra_totals.json`, fetcher, {
    suspense: true,
  })
  return swr
} 