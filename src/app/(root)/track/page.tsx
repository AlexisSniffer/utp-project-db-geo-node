'use client'

import { useEffect, useState } from 'react'
import { socket } from '../../../socket'
import { CoordsProps } from '@/types/coords.types'

export default function Track() {
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
    const interval = setInterval(getLocation, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
      <p>Socket ID: {socket.id}</p>
      <br />

      <div>
        Mensajes:
        {coords.map((coord, index) => (
          <div
            key={index}
            style={{
              marginBottom: '8px',
              padding: '8px',
              border: '1px solid #eee',
              borderRadius: '4px',
            }}
          >
            <strong>Node:</strong> {coord.node}
            <strong>Latitude:</strong> {coord.coords.latitude}
            <strong>Longitude:</strong> {coord.coords.longitude}
          </div>
        ))}
      </div>
      <br />

      <br />
      <br />
    </>
  )
}
