// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Senha padrão para toda a nova equipe
  const defaultPassword = await hash('123456', 8);

  console.log('⏳ Contratando a equipe da Oficina Avance...');

  // 1. Lista com todos os funcionários, com o novo login da Oficina Avance!
  const employees = [
    { email: 'daniel@oficinaavance.com.br', name: 'Daniel Barros Almeida', role: 'ADMIN', department: 'Diretoria' },
    { email: 'paulo@oficinaavance.com.br', name: 'Paulo Roberto da Silveira', role: 'MANAGER', department: 'Gerência' },
    { email: 'leticia@oficinaavance.com.br', name: 'Letícia Cunha Ribeiro', role: 'ADMIN_AUX', department: 'Administração' },
    { email: 'estela@oficinaavance.com.br', name: 'Estela Silva Maria da Cruz', role: 'ADMIN_AUX', department: 'Administração' },
    { email: 'roberval@oficinaavance.com.br', name: 'Roberval Dantas Almeida', role: 'MECHANIC', department: 'Oficina' },
    { email: 'jose@oficinaavance.com.br', name: 'José Tulio Bastos de Andrade', role: 'MECHANIC', department: 'Oficina' },
    { email: 'leonardo@oficinaavance.com.br', name: 'Leonardo Freitas da Silva', role: 'RECEPTIONIST', department: 'Recepção' },
    { email: 'tatiane@oficinaavance.com.br', name: 'Tatiane Dias Gomes', role: 'RECEPTIONIST', department: 'Recepção' },
  ] as const;

  // 2. Criar ou atualizar cada funcionário no banco
  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        name: emp.name,
        role: emp.role,
        department: emp.department,
      },
      create: {
        name: emp.name,
        email: emp.email,
        password: defaultPassword,
        role: emp.role,
        department: emp.department,
      },
    });
  }

  // 3. Cliente genérico só para manter a estrutura funcionando (você edita/exclui depois)
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

  console.log('✅ Equipe da Oficina Avance cadastrada com sucesso!');
  console.log('================================================================');
  console.log('🔐 DADOS DE ACESSO DA EQUIPE:');
  console.log('Login: e-mail do funcionário (ex: daniel@oficinaavance.com.br)');
  console.log('Senha: 123456');
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