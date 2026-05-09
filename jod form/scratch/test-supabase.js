
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zzzemhsbrfjgdlseqmxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6emVtaHNicmZqZ2Rsc2VxbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODE5NzIsImV4cCI6MjA5MjE1Nzk3Mn0.H2jnbF2mSBu6hMUCoWIFtUP3JYjB5Ju3HwXZFW28LWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('jobs').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error('Connection failed:', error.message);
  } else {
    console.log('Connection successful! Job count:', data);
  }
}

testConnection();
