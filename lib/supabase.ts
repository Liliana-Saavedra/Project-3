import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfwvfbqzpaeyztgqhhtb.supabase.co';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1md3ZmYnF6cGFleXp0Z3FoaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTA5NzEsImV4cCI6MjA3ODEyNjk3MX0.zlQWmN_8IDn-3AFcLjeBBtxLF8CYH4G4BqSgZspEj7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});