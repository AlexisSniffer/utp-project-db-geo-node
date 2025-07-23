'use client'

import { CoordsProps } from '@/types/coords.types'
import Feature from 'ol/Feature'
import Map from 'ol/Map'
import View from 'ol/View'
import Point from 'ol/geom/Point'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import React, { useEffect, useRef } from 'react'

interface Props {
  coords: CoordsProps[] | null
  center?: [number, number]
  zoom?: number
}

const OpenLayersMap: React.FC<Props> = ({ coords, center, zoom }: Props) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<Map | null>(null)
  const pointFeature = useRef<Feature>(new Feature())

  useEffect(() => {
    if (!mapRef.current) return

    const view = new View({
      center: center ? center : [0, 0],
      zoom: zoom ?? 2,
    })

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [pointFeature.current],
      }),
    })

    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: view,
    })

    mapInstance.current = map

    return () => {
      map.setTarget(undefined)
    }
  }, [center, zoom])

  useEffect(() => {
    if (!coords || !mapInstance.current) return

    if (!coords.length) return

    const positions = coords.map((coord) =>
      fromLonLat([coord.coords.longitude, coord.coords.latitude]),
    )

    const features = positions.map((pos) => {
      const feature = new Feature(new Point(pos))
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: '#C62828' }),
            stroke: new Stroke({ color: '#455A64', width: 1 }),
          }),
        }),
      )
      return feature
    })

    const map = mapInstance.current
    const vectorLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer instanceof VectorLayer) as VectorLayer

    const vectorSource = vectorLayer.getSource() as VectorSource
    vectorSource.clear()
    vectorSource.addFeatures(features)

    map.getView().setCenter(positions[0])
  }, [coords])

  return (
    <>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
        }}
      />
    </>
  )
}

export default OpenLayersMap
