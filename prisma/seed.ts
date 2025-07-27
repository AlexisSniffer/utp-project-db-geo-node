import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const user = await prisma.users.upsert({
    where: { email: 'admin@utp.com' },
    update: {
      updatedAt: new Date(),
    },
    create: {
      email: 'admin@utp.com',
      username: 'admin',
      password: hashedPassword,
    },
  })

  console.log('✅ Seeding completado exitosamente!')
  console.log(`👤 Usuarios creados: ${user.username}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
