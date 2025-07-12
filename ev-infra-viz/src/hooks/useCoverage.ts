import useSWR from 'swr'
import { jsonFetcher } from './fetcher'

export interface CoverageRow {
  state: string
  year: number
  coverage_pct: number
  readiness_tier: string
  stations_per_million: number
}

export const useCoverage = () => {
  return useSWR<CoverageRow[]>('data/coverage_scores.json', jsonFetcher, { suspense: true })
} 