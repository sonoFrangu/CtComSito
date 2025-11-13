import { createClient } from '@supabase/supabase-js';

// Configurazione Supabase (client pubblico, lato browser)
const supabaseUrl = 'https://bvdsyogzgkgjkwnnycyr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZHN5b2d6Z2tnamt3bm55Y3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTE5OTYsImV4cCI6MjA3ODU4Nzk5Nn0.6Iw2r8hXg6VN-kmw4NoOTSGRzMH20SP2PhbTq1o3G-0';

if (!supabaseUrl || !supabaseKey) {
  alert('ERRORE configurazione Supabase: URL o KEY mancanti.');
  console.error('Missing Supabase config', { supabaseUrl, supabaseKey });removeEventListener
}

const supabase = createClient(supabaseUrl, supabaseKey);