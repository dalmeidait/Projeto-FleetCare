// backend/src/controllers/WorkOrderController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WorkOrderController {
  
  // ==========================================================
  // 1. FUNÇÃO INTERNA: RECALCULAR TOTAIS AUTOMATICAMENTE
  // ==========================================================
  private async recalculateTotals(workOrderId: string) {
    const os = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: { services: true, parts: true }
    });

    if (!os) return;

    // Soma todos os serviços e todas as peças
    const laborTotal = os.services.reduce((acc, curr) => acc + curr.price, 0);
    const partsTotal = os.parts.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
    const grandTotal = laborTotal + partsTotal - os.discount;

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { laborTotal, partsTotal, grandTotal }
    });
  }

  // ==========================================================
  // 2. ABERTURA E LISTAGEM DA O.S.
  // ==========================================================
  
  async create(req: Request, res: Response) {
    const { vehicleId, description, mileage, priority } = req.body;

    try {
      const workOrder = await prisma.workOrder.create({
        data: {
          vehicleId,
          description,
          mileage: mileage ? Number(mileage) : null,
          priority: priority || 'NORMAL',
          // Cria o primeiro registro no Histórico automaticamente!
          history: {
            create: { action: "Ordem de Serviço Aberta" }
          }
        }
      });
      return res.status(201).json(workOrder);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao abrir Ordem de Serviço." });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const workOrders = await prisma.workOrder.findMany({
        include: {
          vehicle: { include: { client: true } },
          mechanic: { select: { id: true, name: true } }
        },
        orderBy: { number: 'desc' } 
      });
      return res.json(workOrders);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao carregar Ordens de Serviço." });
    }
  }

  // Busca o Dossiê Completo de uma única O.S. (Com abas)
  async show(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const workOrder = await prisma.workOrder.findUnique({
        where: { id },
        include: {
          vehicle: { include: { client: true } },
          mechanic: { select: { id: true, name: true } },
          services: true,
          parts: true,
          history: { orderBy: { createdAt: 'desc' } }
        }
      });
      return res.json(workOrder);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao carregar detalhes da O.S." });
    }
  }

  // ==========================================================
  // 3. ATUALIZAÇÕES GERAIS E STATUS
  // ==========================================================

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, mechanicId, reason } = req.body; // <-- Adicionado o reason (motivo)

    try {
      // 1. Atualiza o status
      const workOrder = await prisma.workOrder.update({
        where: { id },
        data: { 
          status, 
          mechanicId,
          // Bate o ponto de saída se finalizar ou cancelar
          endDate: status === 'FINISHED' || status === 'CANCELED' ? new Date() : null 
        }
      });

      // 2. Grava no histórico a mudança! Se tiver motivo (reabertura), ele anota.
      const actionText = reason 
        ? `O.S. REABERTA para ${status}. Motivo: ${reason}` 
        : `Status alterado para: ${status}`;

      await prisma.osHistory.create({
        data: {
          workOrderId: id,
          action: actionText
        }
      });

      return res.json(workOrder);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao atualizar status." });
    }
  }

  async updateDetails(req: Request, res: Response) {
    const { id } = req.params;
    const { diagnostic, cause, notes, priority, discount } = req.body;

    try {
      const workOrder = await prisma.workOrder.update({
        where: { id },
        data: { 
          diagnostic, cause, notes, priority, 
          discount: discount ? Number(discount) : undefined 
        }
      });
      
      // Se mudou o desconto, tem que recalcular a matemática toda!
      if (discount !== undefined) {
        const controller = new WorkOrderController();
        await controller.recalculateTotals(id);
      }

      return res.json(workOrder);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao atualizar detalhes técnicos." });
    }
  }

  // ==========================================================
  // 4. GESTÃO DE SERVIÇOS E PEÇAS
  // ==========================================================

  async addService(req: Request, res: Response) {
    const { id } = req.params; // ID da OS
    const { description, estimatedTime, realTime, price } = req.body;

    try {
      const service = await prisma.osService.create({
        data: {
          workOrderId: id,
          description,
          estimatedTime: estimatedTime ? Number(estimatedTime) : null,
          realTime: realTime ? Number(realTime) : null,
          price: Number(price)
        }
      });

      const controller = new WorkOrderController();
      await controller.recalculateTotals(id);

      return res.status(201).json(service);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao adicionar serviço." });
    }
  }

  async addPart(req: Request, res: Response) {
    const { id } = req.params; // ID da OS
    const { name, quantity, unitPrice, origin } = req.body;

    try {
      const part = await prisma.osPart.create({
        data: {
          workOrderId: id,
          name,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          origin
        }
      });

      const controller = new WorkOrderController();
      await controller.recalculateTotals(id);

      return res.status(201).json(part);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao adicionar peça." });
    }
  }
}