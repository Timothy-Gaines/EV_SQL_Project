import useSWR from 'swr'
import { jsonFetcher } from './fetcher'
import type { FeatureCollection } from 'geojson'

export const useStatesGeom = () => {
  return useSWR<FeatureCollection>('data/us_states.geojson', jsonFetcher, { suspense: true })
} 