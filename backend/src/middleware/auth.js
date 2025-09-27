import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
