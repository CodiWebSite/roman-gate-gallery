import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Grants the 'admin' role to the calling user, but ONLY if no admin exists yet.
 * This safely bootstraps the very first account as the site administrator.
 * Returns whether the caller is (now) an admin.
 */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw countError;

    if ((count ?? 0) === 0) {
      // upsert (ignore duplicates) so concurrent calls don't throw on the unique constraint
      await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: context.userId, role: "admin" },
          { onConflict: "user_id,role", ignoreDuplicates: true },
        );
    }

    // Always return the real current state for this user.
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw error;
    return { isAdmin: !!data };
  });

/** Ensures the calling user has the 'admin' role, throwing otherwise. */
async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Forbidden: doar administratorii pot gestiona conturi.");
  return supabaseAdmin;
}

const emailSchema = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lists all admin accounts (id + email). Admin only. */
export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);

    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (error) throw error;

    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersError) throw usersError;

    const adminIds = new Set((roles ?? []).map((r) => r.user_id));
    return usersData.users
      .filter((u) => adminIds.has(u.id))
      .map((u) => ({ id: u.id, email: u.email ?? "" }));
  });

/** Creates a new admin account with email + password. Admin only. */
export const createAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);

    const email = data.email.trim().toLowerCase();
    const password = data.password;
    if (!emailSchema.test(email)) throw new Error("Email invalid.");
    if (password.length < 8) throw new Error("Parola trebuie să aibă minim 8 caractere.");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw new Error(createError.message);

    const newId = created.user.id;
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: newId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    if (roleError) throw roleError;

    return { id: newId, email };
  });

/** Removes admin rights from a user (and deletes their account). Admin only. Cannot remove self. */
export const removeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("Nu îți poți șterge propriul cont.");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) throw new Error("Trebuie să existe cel puțin un administrator.");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
