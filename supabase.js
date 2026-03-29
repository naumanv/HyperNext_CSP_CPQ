/* ============================================
   HyperNext CSP — Supabase Client & Helpers
   ============================================ */

const _supa = window.supabase.createClient(
  'https://bhklesrrfnfiyvcqsekn.supabase.co',
  'sb_publishable_2OltT1OjLOflqktWmZaGAA_2Z4biffU'
);

window.supa = {
  db: _supa,

  // ── Auth ──
  signUp: (email, pw, meta) =>
    _supa.auth.signUp({ email, password: pw, options: { data: meta } }),

  signIn: (email, pw) =>
    _supa.auth.signInWithPassword({ email, password: pw }),

  signOut: () => _supa.auth.signOut(),

  getSession: async () => {
    const { data: { session } } = await _supa.auth.getSession();
    return session;
  },

  getUser: async () => {
    const { data: { user } } = await _supa.auth.getUser();
    return user;
  },

  resetPassword: (email) =>
    _supa.auth.resetPasswordForEmail(email, { redirectTo: window.location.href }),

  // ── Profiles ──
  getProfile: (uid) =>
    _supa.from('csp_profiles').select('*').eq('id', uid).single(),

  upsertProfile: (uid, data) =>
    _supa.from('csp_profiles').upsert({ id: uid, ...data }).select().single(),

  updateProfile: (uid, data) =>
    _supa.from('csp_profiles').update(data).eq('id', uid).select().single(),

  getAllProfiles: () =>
    _supa.from('csp_profiles').select('*').order('created_at', { ascending: false }),

  updateAnyProfile: (pid, data) =>
    _supa.from('csp_profiles').update(data).eq('id', pid).select().single(),

  // ── Configurations ──
  getConfigs: (cspId) =>
    _supa.from('csp_configurations').select('*')
      .eq('csp_id', cspId).order('updated_at', { ascending: false }),

  getAllConfigs: () =>
    _supa.from('csp_configurations')
      .select('*, csp_profiles(company_name, contact_email)')
      .order('updated_at', { ascending: false }),

  getConfigById: (id) =>
    _supa.from('csp_configurations').select('*').eq('id', id).single(),

  deleteConfig: (id) =>
    _supa.from('csp_configurations').delete().eq('id', id),

  saveConfig: async (cspId, name, region, az, stateObj) => {
    const { data: ex } = await _supa.from('csp_configurations')
      .select('id').eq('csp_id', cspId).eq('name', name).maybeSingle();
    if (ex) {
      return _supa.from('csp_configurations')
        .update({ state: stateObj, region, az })
        .eq('id', ex.id).select().single();
    }
    return _supa.from('csp_configurations')
      .insert({ csp_id: cspId, name, region, az, state: stateObj })
      .select().single();
  }
};
