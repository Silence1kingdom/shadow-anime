import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ogbagbxkwazovlrdusrq.supabase.co'
const supabaseAnonKey = 'sb_publishable_D2Qjkgupn1Mm9_ymd3D-Yw_JFoiuHTX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
