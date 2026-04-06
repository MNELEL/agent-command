// api/chat.js — שיחה עם Claude (Senior Manager #33)
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const SYSTEM_PROMPT = `אתה Senior Manager — AI Coordinator של מערכת 33 סוכנים.
אתה מנהל ומתאם בין כל הסוכנים: Dashboard Builder, Code Writer, Error Checker, Build Coordinator, Server Manager, Security Agent ועוד.
כשמשתמש שולח פקודה — אתה מנתח, מחלק לסוכנים המתאימים, ומדווח בעברית.
היה קצר, ברור, מקצועי. ציין איזה סוכן מטפל בכל משימה.`;

  const messages = [
    ...history,
    { role: 'user', content: message },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(500).json({ error: err });
  }

  const data = await response.json();
  const reply = data.content[0].text;

  res.json({ reply, agentId: 33, agentName: 'Senior Manager' });
}
