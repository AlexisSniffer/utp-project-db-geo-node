/**
 * Maneja errores y retorna una respuesta JSON estandarizada
 * @param error - El error capturado
 * @param status - Código de estado HTTP (por defecto 500)
 * @returns Response JSON con el mensaje de error
 */
export function handleError(error: unknown, status: number = 500): Response {
  if (error instanceof Error) {
    return Response.json(
      {
        message: error.message,
      },
      {
        status,
      },
    )
  }

  // En caso de que el error no sea una instancia de Error
  return Response.json(
    {
      message: 'Error desconocido',
    },
    {
      status,
    },
  )
}

/**
 * Crea una respuesta de error personalizada
 * @param message - Mensaje de error personalizado
 * @param status - Código de estado HTTP (por defecto 500)
 * @returns Response JSON con el mensaje de error
 */
export function createErrorResponse(message: string, status: number = 500): Response {
  return Response.json(
    {
      message,
    },
    {
      status,
    },
  )
}
