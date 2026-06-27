// OTIS - texto para voz (ElevenLabs). Chave: body.key (cliente) ou process.env.ELEVENLABS_API_KEY.
// Voz por defeito em ELEVENLABS_VOICE_ID. Devolve audio mp3; erros vao como JSON (status 200) para o cliente tratar.

module.exports = async (req, res) => {
  function jres(status, obj) { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); }
  if (req.method !== "POST") { return jres(405, { ok: false, error: "method" }); }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; } }
  if (!body || typeof body !== "object") body = {};
  const key = process.env.ELEVENLABS_API_KEY || body.key;
  const text = (body.text || "").toString().slice(0, 800);
  if (!key) { return jres(200, { ok: false, error: "no-key" }); }
  if (!text.trim()) { return jres(200, { ok: false, error: "no-text" }); }
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "onwK4e9ZLuTAKqWW03F9"; // Daniel (britanico, refinado)
  try {
    const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.8 } })
    });
    if (!r.ok) {
      let t = ""; try { t = await r.text(); } catch (e) {}
      return jres(200, { ok: false, error: "el-" + r.status, detail: t.slice(0, 300) });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.end(buf);
  } catch (e) {
    return jres(200, { ok: false, error: "ex", detail: String((e && e.message) || e).slice(0, 300) });
  }
};
