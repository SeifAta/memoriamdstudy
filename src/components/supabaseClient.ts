// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ovpceepdmbvjttrmfdkp.supabase.co";
const SUPABASE_ANON_KEY = "ovpceepdmbvjttrmfdkp";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
