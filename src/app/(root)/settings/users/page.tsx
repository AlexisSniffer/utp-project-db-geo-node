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
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const { data: users } = useSWR<User[]>(`/api/users`, fetcher)

  const success = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content || 'Operación exitosa',
    })
  }

  const openUserModal = (user?: User) => {
    if (user) {
      setIsEditing(true)
      setEditingUser(user)
      form.setFieldsValue({
        email: user.email,
        username: user.username,
      })
    } else {
      setIsEditing(false)
      setEditingUser(null)
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleAddOrUpdateUser = () => {
    setLoading(true)
    form.validateFields().then(async (values) => {
      try {
        if (isEditing && editingUser) {
          // Editar usuario existente
          const updateData: { id: number; email: string; password?: string } = {
            id: editingUser.id,
            email: values.email,
          }

          // Solo incluir password si se proporcionó uno nuevo
          if (values.password) {
            updateData.password = values.password
          }

          const response = await fetch(`/api/users/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          })

          const responseData = await response.json()

          if (!response.ok) throw new Error(responseData.message || 'Error al actualizar usuario')

          success('Usuario actualizado correctamente')
        } else {
          // Crear nuevo usuario
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

          success('Usuario añadido correctamente')
        }

        form.resetFields()
      } catch (err: unknown) {
        messageApi.open({
          type: 'error',
          content: (err as Error).message,
        })
      } finally {
        mutate('/api/users')
        setModalVisible(false)
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
          <Button type="primary" icon={<EditOutlined />} onClick={() => openUserModal(record)} />
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
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => openUserModal()}>
          Añadir usuario
        </Button>
      </Flex>
      <Table dataSource={users} columns={columns} rowKey="id" />
      <Modal
        title={isEditing ? 'Editar usuario' : 'Añadir usuario'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddOrUpdateUser}
        confirmLoading={loading}
        okText={isEditing ? 'Actualizar' : 'Añadir'}
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
            rules={[{ required: !isEditing, message: 'Por favor ingresa el username' }]}
          >
            <Input disabled={isEditing} />
          </Form.Item>
          <Form.Item
            label={isEditing ? 'Nueva Password (opcional)' : 'Password'}
            name="password"
            rules={[
              { required: !isEditing, message: 'Por favor ingresa el password' },
              { min: 8, message: 'El password debe tener al menos 8 caracteres' },
            ]}
          >
            <Input.Password
              placeholder={isEditing ? 'Dejar vacío para mantener la password actual' : ''}
            />
          </Form.Item>
          <Form.Item
            label={isEditing ? 'Confirmar Nueva Password' : 'Confirmar Password'}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: !isEditing,
                message: 'Por favor confirma el password',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue('password')

                  // Si estamos editando y no hay password, no validar confirmación
                  if (isEditing && !password && !value) {
                    return Promise.resolve()
                  }

                  // Si hay password, debe coincidir con la confirmación
                  if (!value || password === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Los passwords no coinciden'))
                },
              }),
            ]}
          >
            <Input.Password placeholder={isEditing ? 'Confirmar nueva password' : ''} />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}
