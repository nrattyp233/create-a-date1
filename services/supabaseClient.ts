import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xclhndjwlcnkcvibqogv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGhuZGp3bGNua2N2aWJxb2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzIwMjksImV4cCI6MjA3MzYwODAyOX0.91G5pzje2_4cFX-13PPEtnzshnlawRm0KMd2xyiw0Gk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);