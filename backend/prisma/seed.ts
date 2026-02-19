// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Criptografar a senha (hash)
  // O número 8 é o "salt" (custo do processamento), ideal para performance/segurança
  const passwordHash = await hash('admin123', 8)

  // 2. Criar o usuário Admin (usando 'upsert' para não duplicar se já existir)
  const user = await prisma.user.upsert({
    where: { email: 'admin@fleetcare.com' },
    update: {},
    create: {
      name: 'Admin FleetCare',
      email: 'admin@fleetcare.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })