'use client'

import OpenLayersMap from '@/componets/OpenLayersMap'
import { CoordsProps } from '@/types/coords.types'
import { fetcher } from '@/utils/fetcher'
import { formatDateTime } from '@/utils/formatDate'
import { EyeOutlined } from '@ant-design/icons'
import { Button, Flex, Modal, Table, Typography } from 'antd'
import { useState } from 'react'
import useSWR from 'swr'

const { Title } = Typography

type Track = {
  id: string
  latitude: number
  longitude: number
  date: string
  user: {
    id: number
    email: string
    username: string
    password: string
    createdAt: string
    updatedAt: string
  }
}

export default function HistoryPage() {
  const [trackModalVisible, setTrackModalVisible] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<CoordsProps | null>(null)

  const { data: tracks } = useSWR<Track[]>(`/api/tracks`, fetcher)

  const openMapModal = (record: Track) => {
    setTrackModalVisible(true)
    setSelectedTrack({
      node: '',
      date: new Date(),
      coords: {
        latitude: record.latitude,
        longitude: record.longitude,
      },
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'latitude',
      dataIndex: 'latitude',
      key: 'latitude',
    },
    {
      title: 'Longitud',
      dataIndex: 'longitude',
      key: 'longitude',
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => formatDateTime(new Date(text)),
    },
    {
      title: 'Usuario',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: 'Mapa',
      key: 'map',
      render: (record: Track) => (
        <Flex gap="small">
          <Button type="primary" icon={<EyeOutlined />} onClick={() => openMapModal(record)} />
        </Flex>
      ),
    },
  ]

  return (
    <Flex vertical gap={'small'}>
      <Flex justify="space-between" align="center">
        <Title level={2}>Historial de Rastreo</Title>
      </Flex>
      <Table dataSource={tracks} columns={columns} rowKey="id" />
      <Modal
        title={'Trayectoria'}
        open={trackModalVisible}
        onCancel={() => setTrackModalVisible(false)}
        footer={null}
      >
        {selectedTrack && <OpenLayersMap coords={[selectedTrack]} zoom={15} />}
      </Modal>
    </Flex>
  )
}
