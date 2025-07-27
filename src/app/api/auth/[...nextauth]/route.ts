import { prisma } from '@/libs/client'
import bcrypt from 'bcrypt'
import nextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = nextAuth({
  pages: {
    signIn: '/auth/login',
    signOut: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const userFound = await prisma.users.findUnique({
          where: {
            email: credentials?.email,
          },
        })

        if (!userFound) {
          throw new Error('No se pudo encontrar el usuario')
        }

        const matchPassword = await bcrypt.compare(credentials?.password ?? '', userFound.password)

        if (!matchPassword) {
          throw new Error('Contraseña incorrecta')
        }

        return {
          id: String(userFound.id),
          name: userFound.username,
          email: userFound.email,
        }
      },
    }),
  ],
})

export { handler as GET, handler as POST }
