'use client'

import { useEffect, useState } from 'react'
import { socket } from '../../socket'
import { Button } from 'antd'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])

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

    socket.on('message', (msg: string) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('message', message)
      setMessage('')
    }
  }

  return (
    <>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
      <br />

      <div>
        Mensajes:
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <br />
      <br />

      <div>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button onClick={sendMessage}>Enviar</Button>
      </div>
    </>
  )
}
