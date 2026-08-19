"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export async function signIn(formData: FormData): Promise<LoginState | void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Those credentials don't match an active Guardian Vault account." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return {
      error: "This login has no vault profile yet. Please contact the vault team."
    };
  }

  if (profile.status !== "active") {
    await supabase.auth.signOut();
    return { error: "This account is suspended. Please contact the vault team." };
  }

  if (next.startsWith("/")) redirect(next);

  redirect(profile.role === "admin" ? "/admin" : "/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
