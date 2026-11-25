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

export async function resendSignupConfirmation(email, captchaToken) {
  return requireClient().auth.resend({
    type: "signup",
    email,
    options: {
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
  const [profileResult, feedbackResult, contactResult, accessResult, paymentResult, adminResult, groupSettingsResult] = await Promise.all([
    client.from("reading_profiles").select("*").eq("user_id", userId).maybeSingle(),
    client.from("book_feedback").select("book_id,status").eq("user_id", userId),
    client.from("reader_contact_profiles").select("*").eq("user_id", userId).maybeSingle(),
    client.rpc("reader_has_paid_access"),
    client.from("payment_submissions").select("status,submitted_at,reviewed_at,access_expires_at").eq("user_id", userId).order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("platform_admins").select("user_id").eq("user_id", userId).maybeSingle(),
    client.from("reader_group_settings").select("profile_key,invite_url,updated_at"),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (feedbackResult.error) throw feedbackResult.error;
  if (contactResult.error) throw contactResult.error;
  if (accessResult.error) throw accessResult.error;
  if (paymentResult.error) throw paymentResult.error;
  if (adminResult.error) throw adminResult.error;
  if (groupSettingsResult.error) throw groupSettingsResult.error;
  return {
    profile: profileResult.data,
    feedback: feedbackResult.data ?? [],
    contactProfile: contactResult.data,
    hasPaidAccess: Boolean(accessResult.data),
    latestPayment: paymentResult.data,
    isPlatformAdmin: Boolean(adminResult.data),
    groupSettings: groupSettingsResult.data ?? [],
  };
}

export async function saveReaderGroupSettings(settings) {
  const { data, error } = await requireClient().rpc("update_reader_group_settings", {
    p_settings: settings,
  });
  if (error) throw error;
  return data ?? [];
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

export async function submitPaymentProof({ userId, file }) {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
  if (!file || !allowedTypes.has(file.type)) throw new Error("Formato de comprovante não permitido.");
  if (file.size > 5 * 1024 * 1024) throw new Error("O comprovante deve ter até 5 MB.");
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" })[file.type];
  const objectPath = `${userId}/${crypto.randomUUID()}.${extension}`;
  const client = requireClient();
  const { error: uploadError } = await client.storage.from("payment-proofs").upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await client
    .from("payment_submissions")
    .insert({ user_id: userId, receipt_path: objectPath })
    .select("status,submitted_at")
    .single();
  if (error) {
    await client.storage.from("payment-proofs").remove([objectPath]);
    throw error;
  }
  return data;
}

export async function deleteReadingData() {
  const { error } = await requireClient().rpc("delete_my_reading_data");
  if (error) throw error;
}
