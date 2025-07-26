import { prisma } from '@/libs/client'
import bcrypt from 'bcrypt'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return Response.json(users)
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

    const userFound = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (userFound) {
      return Response.json(
        {
          message: 'Email already exists',
        },
        {
          status: 400,
        },
      )
    }

    const usernameFound = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    })

    if (usernameFound) {
      return Response.json(
        {
          message: 'username already exists',
        },
        {
          status: 400,
        },
      )
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    })

    return Response.json(user)
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
