import { getDefaultMessagesForPeriod, getRandomPraise, getTimePeriod } from '@/lib/praise';

const FALLBACK_PRAISE = 'おかえり！今日もよろしく。';

export async function fetchPraiseSettings(supabase) {
  const { data, error } = await supabase
    .from('praise_settings')
    .select('use_default_praise')
    .maybeSingle();
  if (error || !data) return { use_default_praise: true };
  return data;
}

export async function savePraiseSettings(supabase, userId, useDefaultPraise) {
  return supabase.from('praise_settings').upsert({
    user_id: userId,
    use_default_praise: useDefaultPraise,
  });
}

export async function pickLoginPraise(supabase, date = new Date()) {
  const period = getTimePeriod(date);
  const settings = await fetchPraiseSettings(supabase);
  const { data, error } = await supabase
    .from('praise_messages')
    .select('message')
    .eq('period', period);

  const pool = [];
  if (!error && data?.length) {
    pool.push(...data.map((row) => row.message));
  }
  if (settings.use_default_praise) {
    pool.push(...getDefaultMessagesForPeriod(period));
  }

  if (pool.length === 0) {
    return settings.use_default_praise ? getRandomPraise(date) : FALLBACK_PRAISE;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function fetchPraiseMessages(supabase) {
  const { data } = await supabase
    .from('praise_messages')
    .select('*')
    .order('created_at');
  return data || [];
}

export async function addPraiseMessage(supabase, userId, period, message) {
  return supabase.from('praise_messages').insert({
    user_id: userId,
    period,
    message: message.trim(),
  });
}

export async function deletePraiseMessage(supabase, id) {
  return supabase.from('praise_messages').delete().eq('id', id);
}
