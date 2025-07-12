import useSWR from 'swr'
import { jsonFetcher } from './fetcher'

export interface StationFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    name: string
    network: string
    open_date: string
    connectors: string
    pricing: string
    level: string
  }
}

export interface StationsGeo {
  type: 'FeatureCollection'
  features: StationFeature[]
}

export const useStations = () => {
  return useSWR<StationsGeo>('data/stations.geo.json', jsonFetcher, { suspense: true })
} 