'use client'

import { SessionProvider as AuthSessionProvider } from 'next-auth/react'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const SessionProvider = ({ children }: Props) => {
  return <AuthSessionProvider>{children}</AuthSessionProvider>
}

export default SessionProvider
