import { Router } from "express";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

/**
 * GET /leads?q=texto&page=1&pageSize=10&mine=0
 * - q: busca en email/phone/nombre
 * - mine=1: si es AGENT, devuelve solo sus leads
 */
router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || "10", 10)));
  const q = (req.query.q || "").toString().trim();
  const mine = req.query.mine === "1";

  const where = {
    AND: [
      mine && req.user?.role === Role.AGENT ? { agentId: req.user.id } : {},
      q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [total, items] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { agent: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
  ]);

  res.json({ total, page, pageSize, items });
});

// Crear lead
router.post("/", async (req, res) => {
  const { email, phone, firstName, lastName, status, agentId } = req.body || {};
  const lead = await prisma.lead.create({ data: { email, phone, firstName, lastName, status, agentId } });
  res.status(201).json(lead);
});

// Editar lead
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { email, phone, firstName, lastName, status, agentId } = req.body || {};
  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { email, phone, firstName, lastName, status, agentId },
    });
    res.json(lead);
  } catch {
    res.status(404).json({ error: "Lead no encontrado" });
  }
});

// Eliminar lead
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lead.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Lead no encontrado" });
  }
});

export default router;
