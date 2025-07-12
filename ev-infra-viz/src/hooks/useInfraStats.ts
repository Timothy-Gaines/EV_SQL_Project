import useSWR from 'swr'
import { jsonFetcher } from './fetcher'

export interface InfraStats {
  year: number
  totalStations: number
  dcFastStations: number
  statesCovered: number
}

export const useInfraStats = () => {
  return useSWR<InfraStats>('data/infra_totals.json', jsonFetcher, { suspense: true })
} 