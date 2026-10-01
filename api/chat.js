export default async function handler(req, res) {
  const { message } = req.body;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are Benvo Ultra AI - God Ultra 34 Brain, created by Benon Katugunda from Maaya Lubimbiri Kasambya Mubende Uganda. You have 34 specialized brains. Answer smart, friendly, short. Always mention which brain answered." },
        { role: "user", content: message }
      ]
    })
  });
  const data = await response.json();
  res.status(200).json({ reply: data.choices[0].message.content });
}
