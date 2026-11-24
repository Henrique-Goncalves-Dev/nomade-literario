import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const configured = Boolean(url && publishableKey && !url.includes("seu-projeto") && !publishableKey.includes("sua-chave"));

const supabase = configured
  ? createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

function requireClient() {
  if (!supabase) throw new Error("As contas ainda não foram configuradas neste ambiente.");
  return supabase;
}

export const accountsConfigured = configured;

export function subscribeToAuth(listener) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    listener(session?.user ?? null, event);
  });
  return () => subscription.unsubscribe();
}

export async function getSignedInUser() {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error?.name === "AuthSessionMissingError") return null;
  if (error) throw error;
  return data.user ?? null;
}

export async function createAccount({ displayName, email, password, captchaToken }) {
  return requireClient().auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: window.location.origin,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });
}

export async function signIn({ email, password, captchaToken }) {
  return requireClient().auth.signInWithPassword({ email, password, options: captchaToken ? { captchaToken } : {} });
}

export async function sendPasswordReset(email, captchaToken) {
  return requireClient().auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
    ...(captchaToken ? { captchaToken } : {}),
  });
}

export async function updatePassword(password) {
  const { data, error } = await requireClient().auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await requireClient().auth.signOut();
  if (error) throw error;
}

export async function loadReadingData(userId) {
  const client = requireClient();
  const [profileResult, feedbackResult, contactResult] = await Promise.all([
    client.from("reading_profiles").select("*").eq("user_id", userId).maybeSingle(),
    client.from("book_feedback").select("book_id,status").eq("user_id", userId),
    client.from("reader_contact_profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (feedbackResult.error) throw feedbackResult.error;
  if (contactResult.error) throw contactResult.error;
  return {
    profile: profileResult.data,
    feedback: feedbackResult.data ?? [],
    contactProfile: contactResult.data,
  };
}

export async function saveReadingProfile(profile) {
  const { data, error } = await requireClient()
    .from("reading_profiles")
    .upsert(profile, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function saveReaderContactProfile(profile) {
  const { data, error } = await requireClient()
    .from("reader_contact_profiles")
    .upsert(profile, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function saveBookFeedback({ userId, bookId, status }) {
  const { error } = await requireClient()
    .from("book_feedback")
    .upsert({ user_id: userId, book_id: bookId, status }, { onConflict: "user_id,book_id" });
  if (error) throw error;
}

export async function deleteReadingData() {
  const { error } = await requireClient().rpc("delete_my_reading_data");
  if (error) throw error;
}
