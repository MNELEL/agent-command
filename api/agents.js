// api/agents.js — סטטוס סוכנים מ-Supabase
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabase();
  const { id } = req.query;

  // GET /api/agents — כל הסוכנים
  if (req.method === 'GET' && !id) {
    const { data, error } = await supabase
      .from('agent_states')
      .select('*')
      .order('agent_id');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // GET /api/agents?id=7 — סוכן ספציפי
  if (req.method === 'GET' && id) {
    const { data, error } = await supabase
      .from('agent_states')
      .select('*')
      .eq('agent_id', parseInt(id))
      .single();
    if (error) return res.status(404).json({ error: 'agent not found' });
    return res.json(data);
  }

  // POST /api/agents — עדכון סטטוס סוכן
  if (req.method === 'POST') {
    const { agent_id, state } = req.body;
    if (!agent_id || !state) return res.status(400).json({ error: 'agent_id and state required' });

    const { data, error } = await supabase
      .from('agent_states')
      .upsert({ agent_id, state, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, data });
  }

  res.status(405).json({ error: 'Method not allowed' });
    }
