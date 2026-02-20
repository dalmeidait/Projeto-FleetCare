// backend/src/controllers/VehicleController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VehicleController {
  
  // 1. Função para CADASTRAR
  async create(req: Request, res: Response) {
    const { plate, vin, brand, model, year, fuelType, clientId } = req.body;

    try {
      const vehicleExists = await prisma.vehicle.findUnique({ where: { plate } });
      if (vehicleExists) {
        return res.status(400).json({ message: "Esta placa já está cadastrada!" });
      }

      const vinExists = await prisma.vehicle.findUnique({ where: { vin } });
      if (vinExists) {
        return res.status(400).json({ message: "Este Chassi (VIN) já está cadastrado!" });
      }

      const vehicle = await prisma.vehicle.create({
        data: { plate, vin, brand, model, year: Number(year), fuelType, clientId }
      });

      return res.status(201).json(vehicle);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao cadastrar veículo." });
    }
  }

  // 2. Função para LISTAR (Era essa que estava faltando!)
  async list(req: Request, res: Response) {
    try {
      const vehicles = await prisma.vehicle.findMany({
        include: { client: true } 
      });
      return res.json(vehicles);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar veículos." });
    }
  }

  // 3. Função para DELETAR
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.vehicle.delete({
        where: { id }
      });
      return res.status(204).send(); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao deletar veículo." });
    }
  }
}