import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
CREATE POLICY IF NOT EXISTS "Parents can view student by token" ON students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Parents can view records" ON daily_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Parents can view homework" ON homework FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Parents can view notes" ON student_notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Parents can view assignments" ON assignments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Parents can view classes" ON classes FOR SELECT TO anon, authenticated USING (true);
`;

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    console.error("Error (might need to run manually):", error);
  } else {
    console.log("Success!");
  }
}

run();
