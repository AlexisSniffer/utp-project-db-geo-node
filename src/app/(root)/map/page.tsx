'use client'

import { useEffect, useState } from 'react'
import { socket } from '../../../socket'
import { CoordsProps } from '@/types/coords.types'
import OpenLayersMap from '@/componets/OpenLayersMap'

export default function Map() {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')
  const [coords, setCoords] = useState<CoordsProps[]>([])

  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      setIsConnected(true)
      setTransport(socket.io.engine.transport.name)

      socket.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name)
      })
    }

    function onDisconnect() {
      setIsConnected(false)
      setTransport('N/A')
    }

    socket.on('message', (msg: CoordsProps) => {
      setCoords((prev) => [...prev, msg])
    })

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  // Captura coordenadas cada 10 segundos
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            socket.emit('message', { node: socket.id, coords: position.coords })
          },
          (error) => {
            console.error('Error obteniendo coordenadas:', error)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        )
      }
    }

    getLocation()
    const interval = setInterval(getLocation, 20000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <OpenLayersMap />
    </>
  )
}
