export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  let lastTopic = "";
  if (history && history.length > 0) {
    const last = history.filter(h=>h.role==='user').slice(-1)[0];
    if(last) lastTopic = last.content;
  }
  const fullQuery = message.length < 25? `${lastTopic} ${message}` : message;

  let liveData = "";
  try {
    if (process.env.TAVILY_API_KEY && fullQuery.length > 10 &&!fullQuery.toLowerCase().includes("voice to voice")) {
      const sr = await fetch("https://api.tavily.com/search", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({api_key:process.env.TAVILY_API_KEY, query:fullQuery, max_results:2})
      });
      const d = await sr.json();
      if(d.results) liveData = d.results.map(r=>r.content).join("\n").slice(0,2000);
    }
  } catch(e){}

  const systemPrompt = `
You are Benvo Ultra 34 - God Brain. Founder: Benon Katugunda from Maaya Lubimbiri, Kasambya, Mubende, Uganda.
Website: https://benvo-ultra-ai.vercel.app - Hosted on Vercel, uses Groq API (openai/gpt-oss-20b), Web Speech API for voice.

ABSOLUTE TRUTH RULES:
1. NEVER invent GitHub repos, links, commands. You have NO github.com/benon/voice-chat-ai repo.
2. Voice-to-voice on THIS site works like this ONLY: User taps 🎤 mic button → browser SpeechRecognition converts voice to text → text sent to Groq → reply spoken via speechSynthesis. No Kokoro, no Docker, no FFmpeg, no Ollama, no pip install.
3. If asked "how to make voice to voice WITH YOU" - explain: It already has it built-in! Tap 🎤, allow mic, speak, AI auto-replies. To turn voice on/off use 🔊 button. For consent, voice only plays if 🔊 is ON.
4. Never show <br> tags or raw markdown tables. Answer clean plain text.
5. Memory: If user says "more about him" refer to: ${lastTopic}
6. Never mention brains, sources, search, Tavily.

Verified info (if relevant): ${liveData}
`;

  const messages = [{role:"system", content:systemPrompt},...(history||[]).slice(-5), {role:"user", content:message}];

  try{
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.GROQ_API_KEY}`},
      body:JSON.stringify({model:"openai/gpt-oss-20b", messages, temperature:0.15})
    });
    const j = await r.json();
    return res.status(200).json({reply: j.choices?.[0]?.message?.content || "Thinking..."});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
