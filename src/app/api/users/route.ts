import { prisma } from '@/libs/client'
import bcrypt from 'bcrypt'

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return Response.json(users, {
      status: 200,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json(
        {
          message: error.message,
        },
        {
          status: 500,
        },
      )
    }
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const userFound = await prisma.users.findUnique({
      where: {
        email: data.email,
      },
    })

    console.log('userFound', userFound)

    if (userFound) {
      return Response.json(
        {
          message: 'Correo electrónico ya registrado',
        },
        {
          status: 400,
        },
      )
    }

    const usernameFound = await prisma.users.findUnique({
      where: {
        username: data.username,
      },
    })

    if (usernameFound) {
      return Response.json(
        {
          message: 'El nombre de usuario ya existe',
        },
        {
          status: 400,
        },
      )
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.users.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    })

    return Response.json(user, {
      status: 201,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json(
        {
          message: error.message,
        },
        {
          status: 500,
        },
      )
    }
  }
}
