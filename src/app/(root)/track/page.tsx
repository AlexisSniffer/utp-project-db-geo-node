'use client'

import OpenLayersMap from '@/componets/OpenLayersMap'
import { CoordsProps } from '@/types/coords.types'
import { Badge, Card, Col, Flex, Row, Slider, Table, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { socket } from '../../../socket'

const { Text } = Typography

export default function Track() {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')
  const [coords, setCoords] = useState<CoordsProps[]>([])
  const [zoom, setZoom] = useState<number>(2)

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

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const track: CoordsProps = {
              node: socket.id!,
              date: new Date(),
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            }

            setCoords((prevCoords) => {
              return prevCoords.length >= 10
                ? [...prevCoords.slice(1), track]
                : [...prevCoords, track]
            })
            socket.emit('message', track)
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
      <Flex vertical gap={16}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card title="Conexión" style={{ width: '100%' }}>
              {
                <Badge
                  status={isConnected ? 'success' : 'error'}
                  text={isConnected ? 'Conectado' : 'Desconectado'}
                />
              }
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card title="Transportador" style={{ width: '100%' }}>
              <Text>{transport}</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card title="Socket ID" style={{ width: '100%' }}>
              <Text>{socket.id ?? 'N/A'}</Text>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Table
              dataSource={coords}
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Fecha',
                  dataIndex: 'date',
                  key: 'date',
                  defaultSortOrder: 'descend',
                  render: (date) => new Date(date).toLocaleString(),
                },
                {
                  title: 'Coordenadas',
                  children: [
                    { title: 'Latitud', dataIndex: ['coords', 'latitude'], key: 'latitude' },
                    { title: 'Longitud', dataIndex: ['coords', 'longitude'], key: 'longitude' },
                  ],
                },
              ]}
            ></Table>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Mapa - Posición Actual" style={{ width: '100%' }}>
              <Flex vertical gap={8}>
                <OpenLayersMap
                  coords={coords && coords.length ? [coords[coords.length - 1]] : []}
                  zoom={zoom}
                />
                <Row>
                  <Col span={24}>
                    <Flex align="center">
                      <Text style={{ marginRight: 8 }}>Zoom:</Text>
                      <Text style={{ marginRight: 8 }}>1</Text>
                      <Slider
                        min={1}
                        max={15}
                        value={zoom}
                        onChange={setZoom}
                        style={{ flex: 1 }}
                      />
                      <Text style={{ marginLeft: 8 }}>15</Text>
                    </Flex>
                  </Col>
                </Row>
              </Flex>
            </Card>
          </Col>
        </Row>
      </Flex>
    </>
  )
}
