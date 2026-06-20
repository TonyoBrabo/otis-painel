// OTIS - verificacao de palavra-passe (server-side). A password vem de process.env.SITE_PASSWORD.
// Se SITE_PASSWORD nao estiver definida, o site fica aberto (sem gate) ate ser configurada na Vercel.

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ ok: false }); return; }
  const pw = process.env.SITE_PASSWORD;
  if (!pw) { res.status(200).json({ ok: true, configured: false }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; } }
  const given = (body && body.pw) || "";
  res.status(200).json({ ok: given === pw, configured: true });
};
