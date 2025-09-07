import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ifasmyduyngrbzxngdfm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYXNteWR1bnlncmJ6eG5nZGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTI4NDEsImV4cCI6MjA3Mjc4ODg0MX0.RvaUW_-9qCPZAyyP-hW6psm__lLUTJL2OdO5SaDiQNc'

export const supabase = createClient(supabaseUrl, supabaseKey)