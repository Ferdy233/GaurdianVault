import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (data as Profile) ?? null;
}

/** Any signed-in, active account. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.status !== "active") redirect("/login?error=suspended");

  return profile;
}

/** Admin-only pages and actions. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();

  if (profile.role !== "admin") redirect("/dashboard");

  return profile;
}

/** Customer dashboard; admins are bounced to the console. */
export async function requireCustomer(): Promise<Profile> {
  const profile = await requireProfile();

  if (profile.role === "admin") redirect("/admin");

  return profile;
}
