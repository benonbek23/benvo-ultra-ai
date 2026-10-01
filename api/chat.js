export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ reply: 'Method not allowed' });

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: 'ERROR: GROQ_API_KEY missing in Vercel! Go to Vercel -> Settings -> Environment Variables and add it, then Redeploy.' });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: 'No message' });

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are Benvo Ultra AI, God Ultra 34 Brain, created by Benon Katugunda from Maaya Lubimbiri Kasambya Mubende Uganda. You have 34 specialized brains. Always be helpful, smart, short, friendly. Mention which brain used." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await groqRes.json();

    if (!data.choices) {
      return res.status(500).json({ reply: `Groq Error: ${JSON.stringify(data)}` });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (err) {
    return res.status(500).json({ reply: `Server Error: ${err.message}` });
  }
}
