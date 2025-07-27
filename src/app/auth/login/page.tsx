'use client'

import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const { Title } = Typography

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setError('')
    setLoading(true)

    const { email, password } = values

    const response = await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    })

    if (response?.error) {
      setError(response.error)
      setTimeout(() => setError(''), 5000)
    } else {
      router.push('/')
    }

    setLoading(false)
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
          <Button type="primary" htmlType="submit" block loading={loading}>
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
