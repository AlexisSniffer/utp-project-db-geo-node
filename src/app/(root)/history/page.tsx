'use client'

import OpenLayersMap from '@/componets/OpenLayersMap'
import { CoordsProps } from '@/types/coords.types'
import { fetcher } from '@/utils/fetcher'
import { formatDateTime } from '@/utils/formatDate'
import { EyeOutlined, FilePdfOutlined } from '@ant-design/icons'
import { Button, Flex, Modal, Table, Typography } from 'antd'
import { useState } from 'react'
import useSWR from 'swr'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

  const { data: tracks, error } = useSWR<Track[]>(`/api/tracks`, fetcher)

  if (error) {
    return <div>Error cargando coordenadas</div>
  }

  const generatePDFReport = () => {
    if (!tracks || tracks.length === 0) {
      return
    }

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text('Reporte de Historial de Rastreo', 14, 22)

    // Add generation date
    doc.setFontSize(12)
    doc.text(`Generado el: ${formatDateTime(new Date())}`, 14, 32)

    // Prepare data for the table
    const tableData = tracks.map((track) => [
      track.id,
      track.latitude.toString(),
      track.longitude.toString(),
      formatDateTime(new Date(track.date)),
      track.user.username,
    ])

    // Add table
    autoTable(doc, {
      head: [['ID', 'Latitud', 'Longitud', 'Fecha', 'Usuario']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // Save the PDF
    doc.save(`reporte-rastreo-${new Date().toISOString().split('T')[0]}.pdf`)
  }

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
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={generatePDFReport}
          disabled={!tracks || tracks.length === 0}
        >
          Exportar PDF
        </Button>
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
