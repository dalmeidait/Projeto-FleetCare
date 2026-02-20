// backend/src/controllers/WorkOrderController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WorkOrderController {
  
  // 1. ABRIR UMA NOVA O.S.
  async create(req: Request, res: Response) {
    const { description, vehicleId, mechanicId } = req.body;

    try {
      const workOrder = await prisma.workOrder.create({
        data: {
          description,
          vehicleId,
          mechanicId,
        }
      });
      return res.status(201).json(workOrder);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao abrir Ordem de Serviço." });
    }
  }

  // 2. LISTAR TODAS AS O.S.
  async list(req: Request, res: Response) {
    try {
      const workOrders = await prisma.workOrder.findMany({
        include: {
          vehicle: {
            include: { client: true } 
          },
          mechanic: {
            select: { id: true, name: true } 
          }
        },
        orderBy: { number: 'desc' } 
      });
      return res.json(workOrders);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao carregar Ordens de Serviço." });
    }
  }

  // 3. ATUALIZAR STATUS DA O.S.
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, mechanicId, endDate } = req.body;

    try {
      const workOrder = await prisma.workOrder.update({
        where: { id },
        data: { 
          status, 
          mechanicId,
          endDate 
        }
      });
      return res.json(workOrder);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao atualizar a Ordem de Serviço." });
    }
  }
}