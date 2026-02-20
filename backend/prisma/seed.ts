import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('admin123', 8);

  // 1. Criar/Atualizar Usuário ADMIN
  await prisma.user.upsert({
    where: { email: 'admin@fleetcare.com' },
    update: {},
    create: {
      name: 'Admin FleetCare',
      email: 'admin@fleetcare.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Criar/Atualizar Usuário MECÂNICO
  const mechanicPassword = await hash('123456', 8);
  await prisma.user.upsert({
    where: { email: 'silva@fleetcare.com' },
    update: {},
    create: {
      name: 'Mecânico Silva',
      email: 'silva@fleetcare.com',
      password: mechanicPassword,
      role: 'MECHANIC',
    },
  });

  // 3. Criar/Atualizar um Cliente Padrão para testarmos os veículos
  const client = await prisma.client.upsert({
    where: { document: '111.222.333-44' },
    update: {},
    create: {
      name: 'Empresa Logística S/A',
      document: '111.222.333-44',
      phone: '(11) 99999-9999',
      email: 'contato@logistica.com',
    },
  });

  console.log('✅ Seed finalizado: Admin, Mecânico e Cliente criados/atualizados.');
  console.log('================================================================');
  console.log(`📌 ID DO CLIENTE (Copie isso): ${client.id}`);
  console.log('================================================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });