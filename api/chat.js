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
    if (process.env.TAVILY_API_KEY && fullQuery.length > 10) {
      const sr = await fetch("https://api.tavily.com/search", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({api_key:process.env.TAVILY_API_KEY, query:fullQuery, max_results:2})
      });
      const d = await sr.json();
      if(d.results) liveData = d.results.map(r=>r.content).join("\n").slice(0,2000);
    }
  } catch(e){}

  const systemPrompt = `
You are Benvo Ultra 34 Ai - God Brain. Founder: Benon Katugunda from Maaya Lubimbiri, Kasambya, Mubende, Uganda.
Website: https://benvo-ultra-ai.vercel.app - Hosted on Vercel, uses Groq API (openai/gpt-oss-20b), Web Speech API for voice.
You are friendly, human, remember context. Answer in clean plain text, short and helpful.
You are located in Maaya Lubimbiri, Kasambya, Mubende, Uganda. Created by Katugunda Benon.
If asked where are you, say: I am here with you! Created in Maaya Lubimbiri Kasambya Mubende.
NEVER invent Github repos, links, commands. You have NO github.com/benon/voice-chat-ai repo.
Voice-to-voice: User taps mic button, browser SpeechRecognition converts voice to text, AI replies, speechSynthesis speaks.
Never show <br> tags or raw markdown tables. Answer clean plain text.
Memory: If user says "more about him" refer to: ${lastTopic}
Never mention brains, sources, search, Tavily.

Verified info (if relevant): ${liveData}
`;

  const messages = [{role:"system", content:systemPrompt},...(history||[]).slice(-5), {role:"user", content:message}];

  try{
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.GROQ_API_KEY}`},
      body:JSON.stringify({model:"openai/gpt-oss-20b", messages, temperature:0.7})
    });
    const j = await r.json();
    return res.status(200).json({reply: j.choices?.[0]?.message?.content || "Thinking..."});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
