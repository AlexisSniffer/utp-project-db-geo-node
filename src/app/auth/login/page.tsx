'use client'

import React, { useState } from 'react'
import { Form, Input, Button, Alert, Typography, Card } from 'antd'

const { Title } = Typography

export default function LoginPage() {
  const [error, setError] = useState<string>('')

  const onFinish = (values: { email: string; password: string }) => {
    setError('')
    const { email, password } = values
    if (email === 'admin@example.com' && password === '123') {
      alert('Login exitoso')
    } else {
      setError('Credenciales inválidas')
      setTimeout(() => setError(''), 5000)
    }
  }

  return (
    <Card
      style={{
        maxWidth: 400,
        margin: '40px auto',
        padding: 24,
        borderRadius: 8,
      }}
    >
      <Title level={2}>Iniciar sesión</Title>
      <Form layout="vertical" onFinish={onFinish}>
        {error && (
          <Form.Item>
            <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
          </Form.Item>
        )}
        <Form.Item
          label="Correo electrónico"
          name="email"
          rules={[
            { required: true, message: 'Por favor ingresa tu correo electrónico' },
            { type: 'email', message: 'Ingresa un correo válido' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Contraseña"
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
