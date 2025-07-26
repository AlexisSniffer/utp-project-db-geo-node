'use client'

import React, { useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Flex } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { Typography } from 'antd'

const { Title } = Typography

type User = {
  id: number
  email: string
  username: string
  createdAt: string
  updatedAt: string
}

const mockUsers: User[] = [
  {
    id: 1,
    email: 'john@example.com',
    username: 'john',
    createdAt: '2024-06-01T12:00:00Z',
    updatedAt: '2024-06-01T12:00:00Z',
  },
  {
    id: 2,
    email: 'jane@example.com',
    username: 'jane',
    createdAt: '2024-06-02T12:00:00Z',
    updatedAt: '2024-06-02T12:00:00Z',
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Usuario añadido',
    })
  }

  const handleAddUser = () => {
    form.validateFields().then(async (values) => {
      const newUser: User = {
        id: users.length + 1,
        email: values.email,
        username: values.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      try {
        const response = await fetch('/api/auth/register', {
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
        if (!response.ok) throw new Error('Error al registrar usuario')

        setUsers([...users, newUser])
        setModalVisible(false)
        success()
        form.resetFields()
      } catch (err: unknown) {
        messageApi.open({
          type: 'error',
          content: (err as Error).message,
        })
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Creado', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Actualizado', dataIndex: 'updatedAt', key: 'updatedAt' },
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
        okText="Añadir"
        cancelText="Cancelar"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            email: 'alexis.sniffer@gmail.com',
            username: 'AlexisSniffer',
            password: 'Pruebas001',
            confirmPassword: 'Pruebas001',
          }}
        >
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
