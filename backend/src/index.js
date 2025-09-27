import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./auth.js";
import { authRequired } from "./middleware/auth.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// salud
app.get("/health", (req, res) => res.json({ ok: true }));

// auth
app.use("/auth", authRoutes);

// ruta protegida de ejemplo
app.get("/me", authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  // nunca devolver password
  const { password, ...safe } = user;
  res.json(safe);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
