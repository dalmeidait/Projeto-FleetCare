// backend/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'; // <-- Importamos o Role aqui!
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await hash('123456', 8);

  console.log('⏳ Atualizando os cargos da equipe e promovendo a Diretoria...');

  const employees = [
    { email: 'daniel@oficinaavance.com.br', name: 'Daniel Barros Almeida', role: 'SYS_ADMIN', department: 'Diretoria / TI' },
    { email: 'paulo@oficinaavance.com.br', name: 'Paulo Roberto da Silveira', role: 'MANAGER', department: 'Gerência' },
    { email: 'leticia@oficinaavance.com.br', name: 'Letícia Cunha Ribeiro', role: 'ADMIN', department: 'Administração' },
    { email: 'estela@oficinaavance.com.br', name: 'Estela Silva Maria da Cruz', role: 'ADMIN', department: 'Administração' },
    { email: 'roberval@oficinaavance.com.br', name: 'Roberval Dantas Almeida', role: 'MECHANIC', department: 'Oficina' },
    { email: 'jose@oficinaavance.com.br', name: 'José Tulio Bastos de Andrade', role: 'MECHANIC', department: 'Oficina' },
    { email: 'leonardo@oficinaavance.com.br', name: 'Leonardo Freitas da Silva', role: 'RECEPTIONIST', department: 'Recepção' },
    { email: 'tatiane@oficinaavance.com.br', name: 'Tatiane Dias Gomes', role: 'RECEPTIONIST', department: 'Recepção' },
  ] as const;

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        name: emp.name,
        role: emp.role as Role, // <-- Forçamos o TypeScript a aceitar!
        department: emp.department,
      },
      create: {
        name: emp.name,
        email: emp.email,
        password: defaultPassword,
        role: emp.role as Role, // <-- Forçamos o TypeScript a aceitar!
        department: emp.department,
      },
    });
  }

  await prisma.client.upsert({
    where: { document: '000.000.000-00' },
    update: {},
    create: {
      name: 'Cliente Avulso',
      document: '000.000.000-00',
      phone: '(00) 00000-0000',
      email: 'contato@cliente.com',
    },
  });

  console.log('✅ Daniel foi promovido a Administrador de Sistemas (SYS_ADMIN)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });