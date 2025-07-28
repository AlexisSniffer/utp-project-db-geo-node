import { prisma } from '@/libs/client'
import { handleError } from '@/utils/errorHandler'

/**
 * Obtiene todos los tracks o los tracks de un usuario específico
 * El header 'x-user-id' es opcional - si se proporciona filtra por usuario, si no trae todos los registros
 * @param req - Request object que contiene los headers opcionales
 * @returns Promise<Response> - Lista de tracks (todos o filtrados por usuario) o mensaje de error
 */
export async function GET(req: Request): Promise<Response> {
  try {
    const userId = req.headers.get('x-user-id')

    // Construir la consulta base
    const whereClause = userId ? { userId: Number(userId) } : {}

    const tracks = await prisma.tracks.findMany({
      where: whereClause,
      select: {
        id: true,
        latitude: true,
        longitude: true,
        date: true,
        user: true,
      },
    })

    if (!tracks || tracks.length === 0) {
      const message = userId
        ? 'No se encontraron tracks para este usuario'
        : 'No se encontraron tracks en la base de datos'

      return Response.json({ message }, { status: 404 })
    }

    return Response.json(tracks, {
      status: 200,
    })
  } catch (error: unknown) {
    return handleError(error)
  }
}

/**
 * Crea un nuevo track en la base de datos
 * Recibe los datos del track en el body de la petición
 * @param req - Request object que contiene los datos del track (userId, latitude, longitude, date)
 * @returns Promise<Response> - Track creado o mensaje de error
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json()

    const track = await prisma.tracks.create({
      data: {
        userId: data.userId,
        latitude: data.latitude,
        longitude: data.longitude,
        date: data.date,
      },
    })

    return Response.json(track, {
      status: 201,
    })
  } catch (error: unknown) {
    return handleError(error)
  }
}
