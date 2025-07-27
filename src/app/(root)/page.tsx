'use client'

import { Button } from 'antd'
import { signOut } from 'next-auth/react'

export default function Home() {
  return (
    <>
      <Button onClick={() => signOut()}>Desconectar</Button>
    </>
  )
}
