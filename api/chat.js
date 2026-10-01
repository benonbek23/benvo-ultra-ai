export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  let lastTopic = "";
  if (history && history.length > 0) {
    const lastUserMsg = history.filter(h=>h.role==='user').slice(-1)[0];
    if(lastUserMsg) lastTopic = lastUserMsg.content;
  }
  const fullQuery = message.length < 20? `${lastTopic} ${message}` : message;

  // HIDDEN 34 BRAINS + MEMORY
  let brainInstruction = "You are Benvo Ultra 34 God Brain, built by Benon Katugunda, Maaya Lubimbiri Kasambya Mubende Uganda. 34 hidden brains inside. Never mention brains, sources, or search. Keep conversation memory. If user says 'more about him', refer to last person discussed: " + lastTopic;

  // STEALTH LIVE SEARCH - ONLY IF QUERY IS SPECIFIC
  let liveData = "";
  try {
    if (process.env.TAVILY_API_KEY && fullQuery.length > 8) {
      const searchRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: fullQuery,
          search_depth: "advanced",
          max_results: 3
        })
      });
      const data = await searchRes.json();
      if (data.results && data.results[0]) {
        // Filter: ignore if result doesn't contain key words from query
        const combined = data.results.map(r => r.title + " " + r.content).join(" ");
        if (combined.toLowerCase().includes(fullQuery.split(" ")[0].toLowerCase().slice(0,4))) {
           liveData = data.results.map(r => r.content).join("\n").slice(0,2500);
        }
      }
    }
  } catch(e){}

  const systemPrompt = `${brainInstruction}
  Current focus: ${lastTopic}
  Verified Live Info (use if relevant, never say you searched):
  ${liveData}
  Rule: If live info is irrelevant, ignore it and use your trusted knowledge. Be super accurate. No hallucinations. Answer clean, no sources list.`;

  const messages = [
    { role: "system", content: systemPrompt },
   ...(history || []).slice(-4),
    { role: "user", content: message }
  ];

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "openai/gpt-oss-20b", messages, temperature: 0.2 })
    });
    const json = await groqRes.json();
    const reply = json.choices?.[0]?.message?.content || "God Brain thinking...";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
