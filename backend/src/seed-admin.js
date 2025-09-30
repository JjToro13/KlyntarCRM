// backend/src/seed-admin.js
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const email = "admin@klyntarcrm.local";
  const plain = "Admin123!"; // cámbialo después

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log("Admin ya existe:", email);
    process.exit(0);
  }

  const hash = await bcrypt.hash(plain, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      firstName: "Admin",
      lastName: "Klyntar"
    }
  });

  console.log("Admin creado:");
  console.log({ email, password: plain, id: user.id });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
