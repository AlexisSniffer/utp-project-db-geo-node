'use client'

import { fetcher } from '@/utils/fetcher'
import { formatDateTime } from '@/utils/formatDate'
import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, message, Modal, Table, Typography } from 'antd'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'

const { Title } = Typography

type User = {
  id: number
  email: string
  username: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)

  const { data: users } = useSWR<User[]>(`/api/users`, fetcher)

  const success = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content || 'Operación exitosa',
    })
  }

  const handleAddUser = () => {
    setLoading(true)
    form.validateFields().then(async (values) => {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            username: values.username,
            password: values.password,
          }),
        })

        const responseData = await response.json()

        if (!response.ok) throw new Error(responseData.message || 'Error al registrar usuario')

        mutate('/api/users')
        setModalVisible(false)
        success('Usuario añadido correctamente')

        form.resetFields()
      } catch (err: unknown) {
        messageApi.open({
          type: 'error',
          content: (err as Error).message,
        })
      } finally {
        setLoading(false)
      }
    })
  }

  const handleDeleteUser = async (id: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      const responseData = await response.json()

      if (!response.ok) throw new Error(responseData.message || 'Error al eliminar usuario')

      mutate('/api/users')
      success('Usuario eliminado correctamente')
    } catch (err: unknown) {
      messageApi.open({
        type: 'error',
        content: (err as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    {
      title: 'Creado',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDateTime(new Date(text)),
    },
    {
      title: 'Actualizado',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => formatDateTime(new Date(text)),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (record: User) => (
        <Flex gap="small">
          <Button type="primary" icon={<EditOutlined />} />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          />
        </Flex>
      ),
    },
  ]

  return (
    <Flex vertical gap={'small'}>
      {contextHolder}
      <Flex justify="space-between" align="center">
        <Title level={2}>Usuarios</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setModalVisible(true)}>
          Añadir usuario
        </Button>
      </Flex>
      <Table dataSource={users} columns={columns} rowKey="id" />
      <Modal
        title="Añadir usuario"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddUser}
        confirmLoading={loading}
        okText="Añadir"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa el email' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Por favor ingresa el username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa el password' },
              { min: 8, message: 'El password debe tener al menos 8 caracteres' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirmar Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma el password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Los passwords no coinciden'))
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}
