/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeckGL } from '@deck.gl/react'
import { Map } from 'react-map-gl'
import { getMapboxToken } from '../lib/getMapboxToken'
import type { Layer } from '@deck.gl/core'

interface Props {
  viewState: any
  layers: Layer[]
  onHover?: (info: any) => void
  onClick?: (info: any) => void
}

export default function DeckCanvas({ viewState, layers, onHover, onClick }: Props) {
  return (
    <DeckGL
      viewState={viewState}
      controller
      layers={layers}
      onHover={onHover}
      onClick={onClick}
    >
      <Map reuseMaps mapStyle="mapbox://styles/mapbox/dark-v11" mapboxAccessToken={getMapboxToken()} />
    </DeckGL>
  )
} 