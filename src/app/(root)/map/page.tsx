'use client'

import OpenLayersMap from '@/componets/OpenLayersMap'
import { CoordsProps } from '@/types/coords.types'
import { Badge, Card, Col, Flex, message, Row, Table, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { socket } from '../../../socket'

const { Text } = Typography

export default function Map() {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')
  const [coords, setCoords] = useState<CoordsProps[]>([])
  const [messageApi, contextHolder] = message.useMessage()

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
      setCoords((prev) => {
        const index = prev.findIndex((node) => node.node === msg.node)
        if (index !== -1) {
          const updated = [...prev]
          updated[index] = { ...updated[index], coords: msg.coords }
          return updated
        } else {
          return [...prev, msg]
        }
      })
    })

    socket.on('alert', (msg: { user: string; text: string }) => {
      messageApi.open({
        type: 'success',
        content: `Usuario: ${msg.user} - Mensaje: ${msg.text}`,
      })
    })

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return (
    <>
      {contextHolder}
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
            <Card title="Nodos" style={{ width: '100%' }}>
              <Text>{coords.length}</Text>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <OpenLayersMap coords={coords} />
          </Col>
          <Col xs={24} lg={8}>
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
                  title: 'Usuario',
                  dataIndex: 'node',
                  key: 'node',
                  render: (node) => node || 'N/A',
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
        </Row>
      </Flex>
    </>
  )
}
