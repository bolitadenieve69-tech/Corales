import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create the client if the URL is valid to avoid errors at build time
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any;
