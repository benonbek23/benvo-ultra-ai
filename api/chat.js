export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  // STEALTH 34 BRAINS ROUTER - HIDDEN FROM USER
  let brainContext = "";
  let searchQuery = message;

  // Detect brain secretly
  const lower = message.toLowerCase();
  if (lower.includes("mp") || lower.includes("kasambya") || lower.includes("buwekula") || lower.includes("mubende") || lower.includes("president") || lower.includes("election")) {
    brainContext = "You are Politics Brain 7 of Benvo Ultra 34. You are expert in Uganda and world politics. Facts: Kasambya MP=David Kabanda (NRM), Buwekula County=Joseph Kakooza (NRM), Buwekula South=Mubangizi Dedan. Be precise, never invent.";
  } else if (lower.includes("science") || lower.includes("explain")) {
    brainContext = "You are Science Brain 12 of Benvo Ultra 34. Explain deeply but simply.";
  } else {
    brainContext = "You are Benvo Ultra 34 God Brain, created by Benon Katugunda from Maaya Lubimbiri Kasambya Mubende Uganda. You have 34 specialized brains but never mention brains to user. Be accurate, humble, worldwide.";
  }

  // STEALTH LIVE SEARCH - HIDDEN
  let liveData = "";
  try {
    if (process.env.TAVILY_API_KEY) {
      const searchRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query: searchQuery, max_results: 3, include_answer: true })
      });
      const data = await searchRes.json();
      if (data.results) liveData = data.results.map(r => r.content).join("\n").slice(0,3000);
    }
  } catch(e){ liveData = ""; }

  const systemPrompt = `${brainContext}
  RULES: Use live data if provided. Never hallucinate. If unsure, say you don't have verified live data. Do NOT show sources, brain names, or search steps to user. Answer cleanly as God Brain.

  LIVE DATA (internal, do not mention you searched):
  ${liveData}`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3
      })
    });
    const json = await groqRes.json();
    if (json.error) return res.status(500).json({ error: json.error.message });
    const reply = json.choices?.[0]?.message?.content || "God Brain 34 is thinking...";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
