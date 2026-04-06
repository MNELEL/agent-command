# Agent Command v9

## קבצים

```
agent-command/
├── index.html        ← דשבורד (פתח ישירות בדפדפן לבדיקה)
├── api/
│   ├── chat.js       ← שיחה עם Claude (#33)
│   ├── agents.js     ← סטטוס סוכנים מ-Supabase
│   └── command.js    ← פקודות לסוכנים
├── vercel.json       ← הגדרות Vercel
├── package.json
└── README.md
```

## שלבים לפריסה

### 1. GitHub
```bash
git init
git add .
git commit -m "Agent Command v9"
git remote add origin https://github.com/USER/agent-command.git
git push -u origin main
```

### 2. Vercel
- כנס ל-vercel.com → New Project
- חבר את ה-repo
- הוסף Environment Variables:

| מפתח | מאיפה לקחת |
|------|------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role |

### 3. Supabase — הרץ ב-SQL Editor
```sql
CREATE TABLE agent_states (
  agent_id   INTEGER PRIMARY KEY,
  state      JSONB   NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id   INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agent_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_events;
```

### 4. חבר את הדשבורד לשרת
בקובץ `index.html`, שנה:
```javascript
DEV_MODE: false,
REST_BASE: 'https://your-project.vercel.app/api',
```
