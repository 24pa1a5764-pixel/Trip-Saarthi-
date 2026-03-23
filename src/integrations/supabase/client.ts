import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://deoknjsjhqojywrwobrf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlb2tuanNqaHFvanl3cndvYnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzkyNjIsImV4cCI6MjA4OTUxNTI2Mn0.4QuKAnlTnla09plHryXOUzZW1HC09f7xPPUOM2ZA02A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
