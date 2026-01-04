import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghogcvkyaleceephgnfg.supabase.co';
const supabaseAnonKey = 'sb_publishable_jfF_XtFcb2Mh8XMFT5FVTA_3Uex-C9o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
