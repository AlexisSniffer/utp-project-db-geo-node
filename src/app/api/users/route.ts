import { prisma } from '@/libs/client'
import bcrypt from 'bcrypt'
import { handleError } from '@/utils/errorHandler'

/**
 * GET /api/users
 *
 * Obtiene la lista de todos los usuarios registrados en el sistema.
 *
 * @returns {Promise<Response>} Lista de usuarios sin incluir las contraseñas
 */
export async function GET(): Promise<Response> {
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
    return handleError(error)
  }
}

/**
 * POST /api/users
 *
 * Crea un nuevo usuario en el sistema.
 *
 * @param {Request} req - Objeto de solicitud que contiene los datos del usuario
 * @param {string} req.body.username - Nombre de usuario único
 * @param {string} req.body.email - Correo electrónico único del usuario
 * @param {string} req.body.password - Contraseña del usuario (será hasheada)
 *
 * @returns {Promise<Response>} Usuario creado o mensaje de error
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json()

    const userFound = await prisma.users.findUnique({
      where: {
        email: data.email,
      },
    })

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
    return handleError(error)
  }
}

/**
 * PUT /api/users/
 *
 * Actualiza los datos de un usuario existente.
 *
 * @param {Request} req - Objeto de solicitud que contiene los datos a actualizar
 * @returns {Promise<Response>} Usuario actualizado o mensaje de error
 */
export async function PUT(req: Request): Promise<Response> {
  try {
    const { id, username, email, password } = await req.json()

    const user = await prisma.users.findUnique({
      where: { id },
    })

    if (!user) {
      return Response.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    let hashedPassword = undefined
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        username: username ?? user.username,
        email: email ?? user.email,
        password: hashedPassword ?? user.password,
      },
    })

    return Response.json(updatedUser, { status: 200 })
  } catch (error: unknown) {
    return handleError(error)
  }
}

/**
 * DELETE /api/users/
 *
 * Elimina un usuario por su ID.
 *
 * @param {Request} req - Objeto de solicitud que contiene el ID del usuario
 * @returns {Promise<Response>} Mensaje de éxito o error
 */
export async function DELETE(req: Request): Promise<Response> {
  try {
    const { id } = await req.json()

    const user = await prisma.users.findUnique({
      where: { id },
    })

    if (!user) {
      return Response.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    await prisma.users.delete({
      where: { id },
    })

    return Response.json({ message: 'Usuario eliminado correctamente' }, { status: 200 })
  } catch (error: unknown) {
    return handleError(error)
  }
}
