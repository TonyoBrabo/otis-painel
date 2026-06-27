// OTIS - texto para voz (ElevenLabs). A chave vem de process.env.ELEVENLABS_API_KEY (so no servidor).
// Voz por defeito configuravel em ELEVENLABS_VOICE_ID. Devolve audio mp3.

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ ok: false }); return; }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) { res.status(200).json({ ok: false, error: "no-key" }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; } }
  const text = ((body && body.text) || "").toString().slice(0, 800);
  if (!text.trim()) { res.status(400).json({ ok: false, error: "no-text" }); return; }
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb"; // George (masculino, maduro)
  try {
    const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true }
      })
    });
    if (!r.ok) { const t = await r.text(); res.status(502).json({ ok: false, error: t.slice(0, 200) }); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e).slice(0, 200) });
  }
};
