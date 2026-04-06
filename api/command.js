// api/command.js — שליחת פקודות לסוכנים
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { agentId, command, params = {} } = req.body;
  if (!agentId || !command) return res.status(400).json({ error: 'agentId and command required' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // שמור את הפקודה כאירוע ב-Supabase
  const { data, error } = await supabase
    .from('agent_events')
    .insert({
      agent_id: agentId,
      event_type: 'command',
      data: { command, params, sentAt: new Date().toISOString() },
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // לוגיקה לפי סוג פקודה
  const COMMAND_HANDLERS = {
    restart: () => ({ ok: true, message: `סוכן #${agentId} מאותחל` }),
    pause:   () => ({ ok: true, message: `סוכן #${agentId} בהשהיה` }),
    report:  () => ({ ok: true, message: `דוח סוכן #${agentId} בהכנה` }),
    status:  () => ({ ok: true, message: `סטטוס סוכן #${agentId} נבדק` }),
  };

  const result = COMMAND_HANDLERS[command]?.() || { ok: true, message: `פקודה ${command} נשלחה לסוכן #${agentId}` };

  res.json({ ...result, eventId: data.id, agentId, command });
                     }
