const supabaseUrl = 'https://xsfyktusduhpyksucwqr.supabase.co';
const supabaseKey = 'sb_publishable_w-pXx13cGW0BixJ6WAeCAQ_pKZm9yfM';
const supabase = supabasejs.createClient(supabaseUrl, supabaseKey);

async function toggleBookmark(manga) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please sign in to bookmark!");

    // Check if already bookmarked
    const { data } = await supabase.from('bookmarks')
        .select('*').eq('user_id', user.id).eq('manga_id', manga.id);

    if (data.length > 0) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('manga_id', manga.id);
        alert("Removed from bookmarks");
    } else {
        await supabase.from('bookmarks').insert([
            { user_id: user.id, manga_id: manga.id, title: manga.title, cover: manga.images[0] }
        ]);
        alert("Added to bookmarks");
    }
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else location.reload();
}
