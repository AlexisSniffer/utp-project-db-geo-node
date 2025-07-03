// components/OpenLayersMap.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'

const OpenLayersMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0], // Centro del mapa en coordenadas EPSG:3857
        zoom: 2,
      }),
    })

    return () => {
      map.setTarget() // Limpia el mapa al desmontar
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '500px', border: '2px solid gray', borderRadius: '8px' }}
    />
  )
}

export default OpenLayersMap
