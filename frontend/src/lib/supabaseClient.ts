import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sfztopbbthkuatrfxqfz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmenRvcGJidGhrdWF0cmZ4cWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTEwNjQsImV4cCI6MjA4NDE2NzA2NH0.qY_gAMS81aM2zDv8Uet5XlB-3nj8yPx4llEnaXvpCAE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
