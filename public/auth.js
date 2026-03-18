const SUPABASE_URL = 'https://xsfyktusduhpyksucwqr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_w-pXx13cGW0BixJ6WAeCAQ_pKZm9yfM';

function getSupabase() {
  return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function toggleBookmark(manga) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }
  const { data } = await sb.from('bookmarks')
    .select('*').eq('user_id', user.id).eq('manga_id', String(manga.id));

  if (data && data.length > 0) {
    await sb.from('bookmarks').delete().eq('user_id', user.id).eq('manga_id', String(manga.id));
    return false; // removed
  } else {
    await sb.from('bookmarks').insert([{
      user_id: user.id,
      manga_id: String(manga.id),
      title: manga.title,
      cover: manga.cover
    }]);
    return true; // added
  }
}

async function handleAuth(email, password, type) {
  const sb = getSupabase();
  const { data, error } = (type === 'signup')
    ? await sb.auth.signUp({ email, password })
    : await sb.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById('auth-error').innerText = error.message;
  } else {
    if (type === 'signup') {
      document.getElementById('auth-error').style.color = '#4caf50';
      document.getElementById('auth-error').innerText = 'Check your email for confirmation!';
    } else {
      window.location.href = 'index.html';
    }
  }
}

async function signOut() {
  const sb = getSupabase();
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

async function getUser() {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function isBookmarked(mangaId) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data } = await sb.from('bookmarks')
    .select('id').eq('user_id', user.id).eq('manga_id', String(mangaId));
  return data && data.length > 0;
}

async function trackHistory(manga) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from('history').upsert({
    user_id: user.id,
    manga_id: String(manga.id),
    title: manga.title,
    cover: manga.cover,
    viewed_at: new Date().toISOString()
  }, { onConflict: 'user_id,manga_id' });
}
