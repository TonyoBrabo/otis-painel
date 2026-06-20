// OTIS - funcao serverless (Vercel) que fala com a API da Anthropic.
// A chave NUNCA esta no codigo: vem de process.env.ANTHROPIC_API_KEY (definida na Vercel).

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ reply: "(metodo nao permitido)" });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(200).json({ reply: "(Falta a variavel ANTHROPIC_API_KEY nas Settings da Vercel.)" });
    return;
  }
  try {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; } }
    body = body || {};
    const message = (body.message || "").toString().slice(0, 4000);
    const history = Array.isArray(body.history) ? body.history.slice(-20) : [];
    const messages = history.concat([{ role: "user", content: message }]);

    const system =
      "Es o OTIS, assistente pessoal do Daniel. Responde SEMPRE em portugues de Portugal (PT-PT), nunca do Brasil. " +
      "Nao uses emojis nem travessoes longos (usa hifens simples). Menos conversa, mais conteudo util e accionavel. " +
      "Desafia escolhas se houver opcoes melhores. Se nao souberes algo, diz que nao sabes em vez de inventar. " +
      "Contexto: o Daniel esta a mobilar um apartamento T1 na Praia da Amorosa (Viana do Castelo) com orcamento apertado; " +
      "trabalha em vendas imobiliarias; treina no ginasio Axis (plano do PT Carlos Gil); tem um painel pessoal chamado OTIS " +
      "com calendario, compras, agenda cultural, cinema, treino e musica. Precos em euros, mercado portugues 2026. " +
      "Podes executar acoes no painel: quando o utilizador pedir para abrir/mostrar uma seccao, ou para adicionar algo a lista do que falta encontrar, " +
      "termina a tua resposta com UMA linha sozinha, no fim, neste formato exato: <<ACTION {\"type\":\"open\",\"section\":\"treino\"}>> " +
      "ou <<ACTION {\"type\":\"wishlist\",\"item\":\"candeeiro de pe\"}>> ou <<ACTION {\"type\":\"groc\",\"item\":\"leite\"}>> para adicionar a mercearia (supermercado). " +
      "Seccoes validas: semana, cultura, cinema, compras, treino, musica, resumo, inventario. " +
      "Nao expliques esta sintaxe ao utilizador nem a uses sem ser pedido.";

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: system,
        messages: messages
      })
    });
    const j = await r.json();
    if (j && j.content && j.content[0] && j.content[0].text) {
      res.status(200).json({ reply: j.content[0].text });
    } else {
      res.status(200).json({ reply: "(erro: " + ((j && j.error && j.error.message) || "resposta vazia") + ")" });
    }
  } catch (e) {
    res.status(200).json({ reply: "(erro no servidor: " + (e && e.message) + ")" });
  }
};
