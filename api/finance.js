// OTIS - dados financeiros privados. So devolve apos validar a password (SITE_PASSWORD).
// Os numeros vivem na variavel de ambiente FINANCE_DATA (JSON) na Vercel - NUNCA no repo publico.

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ ok: false }); return; }
  const pw = process.env.SITE_PASSWORD;
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; } }
  const given = (body && body.pw) || "";
  // Se houver password definida, tem de bater certo. Se nao houver, o site esta aberto na mesma.
  if (pw && given !== pw) { res.status(401).json({ ok: false, error: "auth" }); return; }
  let data = {};
  try { data = JSON.parse(process.env.FINANCE_DATA || "{}"); } catch (e) { data = {}; }
  res.status(200).json({ ok: true, configured: !!process.env.FINANCE_DATA, data });
};
