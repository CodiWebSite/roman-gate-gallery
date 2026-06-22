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
