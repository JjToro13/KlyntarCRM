// backend/src/agents.js
import { Router } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const router = Router();

// Listar agentes
router.get("/", async (_req, res) => {
  const agents = await prisma.user.findMany({
    where: { role: Role.AGENT },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
  });
  res.json(agents);
});

// Crear agente
router.post("/", async (req, res) => {
  const { email, password = "Agente123!", firstName, lastName } = req.body || {};
  if (!email) return res.status(400).json({ error: "email requerido" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "email ya existe" });

  const hash = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: { email, password: hash, firstName, lastName, role: Role.AGENT }
  });

  const { password: _, ...safe } = created;
  res.status(201).json(safe);
});

// Actualizar agente
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, password } = req.body || {};
  const data = { firstName, lastName };
  if (password) data.password = await bcrypt.hash(password, 10);

  try {
    const updated = await prisma.user.update({
      where: { id },
      data
    });
    const { password: _, ...safe } = updated;
    res.json(safe);
  } catch {
    res.status(404).json({ error: "Agente no encontrado" });
  }
});

// Eliminar agente
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Agente no encontrado" });
  }
});

export default router;
