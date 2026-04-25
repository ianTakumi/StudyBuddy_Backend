import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log("Supabase URL:", SUPABASE_URL);
console.log("Supabase Key exists:", !!SUPABASE_SERVICE_ROLE_KEY);
console.log("Key prefix:", SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + "...");
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
