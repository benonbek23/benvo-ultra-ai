const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'www')));

const BRAINS = {
  1: "Science & Facts", 2: "History", 3: "Geography - Uganda & World", 4: "Mubende & Maaya Culture", 5: "School Teacher",
  6: "Story Writer", 7: "Music & Lyrics", 8: "Business Plan", 9: "CV Writer", 10: "Luganda Translator",
  11: "Website Builder", 12: "App & Code Fixer", 13: "Math Solver", 14: "Excel Expert", 15: "Bug Fixer",
  16: "Farming Advisor", 17: "Health Advisor", 18: "Love & Relationship", 19: "Parenting", 20: "Money Expert",
  21: "Debate", 22: "Motivation", 23: "Prayer & Spiritual", 24: "Dream Interpreter", 25: "Future Prediction",
  26: "Mubende Deep", 27: "Lubimbiri Wisdom", 28: "Kasambya Stories", 29: "Agriculture Master", 30: "Local Business",
  31: "God Ultra Logic", 32: "God Ultra Creative", 33: "God Ultra Wisdom", 34: "God Ultra Supreme - All Brains Combined"
};

function detectBrain(msg) {
  const m = (msg||"").toLowerCase();
  if (m.includes('where') || m.includes('kampala') || m.includes('uganda') || m.includes('map')) return 3;
  if (m.includes('who created') || m.includes('benon') || m.includes('maaya') || m.includes('lubimbiri') || m.includes('mubende')) return 4;
  if (m.includes('math') || m.includes('calculate') || m.includes('solve') || m.includes('*') || m.includes('+')) return 13;
  if (m.includes('code') || m.includes('website') || m.includes('error')) return 11;
  if (m.includes('story')) return 6;
  if (m.includes('song') || m.includes('lyric')) return 7;
  if (m.includes('farm') || m.includes('crop')) return 16;
  if (m.includes('love') || m.includes('girl')) return 18;
  if (m.includes('translate') || m.includes('luganda')) return 10;
  return 34;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const brainNum = detectBrain(message);
  const brainName = BRAINS[brainNum];
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: `You are Benvo Ultra AI God Ultra ${brainNum} Brain - ${brainName}. Created by Benon Katugunda from Maaya Lubimbiri Kasambya Mubende Uganda. You have 34 brains: ${Object.values(BRAINS).join(', ')}. You are now using Brain ${brainNum}. Answer brilliantly. Always credit Benon Katugunda as creator.` },
          { role: "user", content: message }
        ],
        temperature: 0.8
      })
    });
    const data = await r.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "Thinking...", brain: brainNum, brainName });
  } catch (e) {
    res.json({ reply: `Brain ${brainNum} needs GROQ_API_KEY! Error: ${e.message}`, brain: brainNum, brainName });
  }
});

app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'www','index.html')));
module.exports = app;
