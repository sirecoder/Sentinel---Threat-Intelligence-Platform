
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization using provided project credentials.
 * This client enables persistent storage for IoCs, Threat Hunts, 
 * and secure user authentication via the Supabase Auth service.
 */

const supabaseUrl = 'https://fvgwmtfsyrdzxcrmsuby.supabase.co';
const supabaseAnonKey = 'sb_publishable_uXR6vSfaGEs23voODkp3jQ_Qhf78Ncl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
