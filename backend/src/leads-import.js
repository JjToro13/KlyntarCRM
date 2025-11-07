import { Router } from "express";
import multer from "multer";
import XLSX from "xlsx";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Archivo requerido (CSV o XLSX)" });

    const buf = req.file.buffer;
    let rows = [];

    const isExcel =
      req.file.originalname.toLowerCase().endsWith(".xlsx") ||
      req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (isExcel) {
      const wb = XLSX.read(buf, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { defval: null }); // usa headers de la primera fila
    } else {
      const csv = buf.toString("utf8");
      rows = Papa.parse(csv, { header: true, skipEmptyLines: true }).data;
    }

    // Normalización básica y mapeo de columnas (ES/EN) + prefijo + montos
    const normalized = [];
    const seen = new Set(); // evitar duplicados por email/phone dentro del archivo

    // helpers
    const firstNonEmpty = (obj, keys) => {
      for (const k of keys) {
        const v = obj[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") return v;
      }
      return null;
    };

    const toStr = (v) => (v == null ? null : String(v).trim());
    const toLower = (v) => (v == null ? null : String(v).trim().toLowerCase());

    // Limpia números monetarios con $, puntos y comas (maneja formatos CL/MX/US/EU)
    const numify = (v) => {
      if (v == null) return null;
      let s = String(v).trim();
      if (s === "") return null;
      // quita símbolo de moneda y espacios
      s = s.replace(/[\s$€£₱₹]|USD|CLP|MXN|COP|ARS|S\/\.|R\$|€|¥/gi, "");
      // deja solo dígitos, comas, puntos y signo
      s = s.replace(/[^\d.,-]/g, "");

      // Si hay coma y punto, asume que la coma es decimal en formato europeo
      if (s.includes(",") && s.includes(".")) {
        // quita separadores de miles (puntos), convierte coma a punto
        s = s.replace(/\./g, "").replace(",", ".");
      } else if (s.includes(",")) {
        // si solo hay coma, asume coma decimal → cámbiala por punto
        s = s.replace(",", ".");
      }
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : null;
    };

    // Telefono con prefijo: une prefijo + numero y normaliza con "+"
    const buildPhone = (prefixRaw, numberRaw) => {
      const pref = toStr(prefixRaw);
      const num = toStr(numberRaw);
      if (!pref && !num) return null;

      // limpia: deja + y dígitos en ambos
      const cleanPref = pref ? pref.replace(/[^\d+]/g, "") : "";
      const cleanNum = num ? num.replace(/[^\d]/g, "") : "";

      // si ya viene todo junto en 'num' con +, respétalo
      if (!cleanPref && /^\+?\d+$/.test(cleanNum)) {
        return cleanNum.startsWith("+") ? cleanNum : `+${cleanNum}`;
      }

      // si hay prefijo y número separados
      let p = cleanPref;
      if (p && !p.startsWith("+")) p = `+${p}`;
      const merged = `${p || ""}${cleanNum}`;
      return merged || null;
    };

    for (const r of rows) {
      // alias de campos en EN/ES
      const email = toLower(
        firstNonEmpty(r, [
          "email",
          "Email",
          "EMAIL",
          "correo",
          "Correo",
          "CORREO",
          "mail",
          "Mail",
        ])
      );

      const numberRaw = firstNonEmpty(r, [
        "phone",
        "Phone",
        "PHONE",
        "numero",
        "Número",
        "NUMERO",
        "NUMERO ",
        "Num",
        "tel",
        "telefono",
        "Teléfono",
        "CELULAR",
        "celular",
        "movil",
        "móvil",
      ]);

      const prefixRaw = firstNonEmpty(r, [
        "prefix",
        "Prefix",
        "PREFIJO",
        "Prefijo",
        "codigo",
        "Código",
        "code",
        "country_code",
        "Predijo", // ← tu encabezado con typo
      ]);

      const phone = buildPhone(prefixRaw, numberRaw);

      const firstName = toStr(
        firstNonEmpty(r, [
          "firstName",
          "firstname",
          "FirstName",
          "FIRSTNAME",
          "nombre",
          "Nombre",
          "name",
          "Name",
        ])
      );

      const lastName = toStr(
        firstNonEmpty(r, [
          "lastName",
          "lastname",
          "LastName",
          "LASTNAME",
          "apellido",
          "Apellido",
          "apellidos",
          "Apellidos",
          "surname",
          "Surname",
        ])
      );

      const country = toStr(
        firstNonEmpty(r, [
          "country",
          "Country",
          "COUNTRY",
          "pais",
          "País",
          "Pais",
        ])
      );

      const source = toStr(
        firstNonEmpty(r, [
          "source",
          "Source",
          "SOURCE",
          "Brand",
          "brand",
          "origen",
          "Origen",
          "fuente",
          "Fuente",
        ])
      );

      const funnel = toStr(firstNonEmpty(r, ["funnel", "Funnel", "FUNNEL"]));

      const depositAmount = numify(
        firstNonEmpty(r, [
          "deposit_amount",
          "depositAmount",
          "Deposito",
          "Depósito",
          "deposit",
          "Deposit",
          "first_deposit",
          "FirstDeposit",
          "PrimerDeposito",
        ])
      );

      // si no tienes netDeposit explícito, puedes igualarlo a depositAmount
      let netDeposit = numify(
        firstNonEmpty(r, ["net_deposit", "netDeposit", "NetDeposit"])
      );

      if (netDeposit == null && depositAmount != null) {
        netDeposit = depositAmount;
      }

      const userBalance = numify(
        firstNonEmpty(r, [
          "user_balance",
          "userBalance",
          "Balance",
          "balance",
          "Saldo",
          "saldo",
        ])
      );

      // duplicados intra-archivo: clave por email|phone
      const key = `${email || ""}|${phone || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // al menos email o phone para considerarlo válido
      if (!email && !phone) continue;

      normalized.push({
        email,
        phone,
        firstName,
        lastName,
        country,
        source,
        funnel,
        depositAmount,
        netDeposit,
        userBalance,
        status: "NEW",
      });
    }

    // Inserción en lotes (evita exceder variables)
    let inserted = 0;
    const chunkSize = 1000;
    for (let i = 0; i < normalized.length; i += chunkSize) {
      const chunk = normalized.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;
      const result = await prisma.lead.createMany({
        data: chunk,
        skipDuplicates: true, // evita duplicados por unique constraints (si los añades)
      });
      inserted += result.count;
    }

    res.json({
      received: rows.length,
      normalized: normalized.length,
      inserted,
      duplicatesOrInvalid: rows.length - inserted,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error importando leads" });
  }
});

export default router;
