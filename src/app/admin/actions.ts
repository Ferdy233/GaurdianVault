"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPANY } from "@/lib/company";
import type { ActionResult } from "@/components/ActionForm";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function numberOrNull(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function refresh(customerId?: string) {
  revalidatePath("/admin");
  if (customerId) revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/dashboard");
}

async function logActivity(
  customerId: string,
  actorId: string,
  action: string,
  detail: string | null,
  visible = false
) {
  const admin = createAdminClient();
  await admin.from("activity_log").insert({
    customer_id: customerId,
    actor_id: actorId,
    action,
    detail,
    visible_to_customer: visible
  });
}

// ---------------------------------------------------------------------------
// Customer accounts
// ---------------------------------------------------------------------------

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const client = createAdminClient();

  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const fullName = text(formData, "full_name");

  if (!email || !password || !fullName) {
    return { error: "Full name, email and a temporary password are required." };
  }

  if (password.length < 10) {
    return { error: "Use a password of at least 10 characters." };
  }

  const { data: created, error: createError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the login." };
  }

  const { error: profileError } = await client.from("profiles").insert({
    id: created.user.id,
    email,
    full_name: fullName,
    phone: optionalText(formData, "phone"),
    client_ref: optionalText(formData, "client_ref"),
    notes: optionalText(formData, "notes"),
    role: "customer",
    status: "active"
  });

  if (profileError) {
    await client.auth.admin.deleteUser(created.user.id);
    return { error: `Login rolled back: ${profileError.message}` };
  }

  await logActivity(created.user.id, admin.id, "Account opened", `Created by ${admin.email}`, true);

  refresh(created.user.id);

  return { success: `Login created for ${email}. Hand the temporary password over securely.` };
}

export async function updateCustomer(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const customerId = text(formData, "customer_id");
  if (!customerId) return { error: "Missing customer." };

  const { error } = await client
    .from("profiles")
    .update({
      full_name: text(formData, "full_name"),
      phone: optionalText(formData, "phone"),
      client_ref: optionalText(formData, "client_ref"),
      notes: optionalText(formData, "notes"),
      status: text(formData, "status") === "suspended" ? "suspended" : "active",
      updated_at: new Date().toISOString()
    })
    .eq("id", customerId);

  if (error) return { error: error.message };

  refresh(customerId);
  return { success: "Client record updated." };
}

export async function resetCustomerPassword(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const client = createAdminClient();

  const customerId = text(formData, "customer_id");
  const password = text(formData, "password");

  if (password.length < 10) return { error: "Use a password of at least 10 characters." };

  const { error } = await client.auth.admin.updateUserById(customerId, { password });
  if (error) return { error: error.message };

  await logActivity(customerId, admin.id, "Password reset", `Reset by ${admin.email}`, true);

  refresh(customerId);
  return { success: "Password reset. Share it with the client in person or by phone." };
}

export async function deleteCustomer(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const customerId = text(formData, "customer_id");
  const { error } = await client.auth.admin.deleteUser(customerId);
  if (error) return { error: error.message };

  refresh();
  redirect("/admin");
}

// ---------------------------------------------------------------------------
// Dashboard visibility
// ---------------------------------------------------------------------------

export async function updateDashboardSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const customerId = text(formData, "customer_id");
  if (!customerId) return { error: "Missing customer." };

  const { error } = await client.from("dashboard_settings").upsert({
    customer_id: customerId,
    welcome_message: text(formData, "welcome_message") || "Welcome to your Guardian Vault.",
    support_contact: text(formData, "support_contact") || COMPANY.email,
    show_values: bool(formData, "show_values"),
    show_documents: bool(formData, "show_documents"),
    show_activity: bool(formData, "show_activity"),
    show_boxes: bool(formData, "show_boxes"),
    updated_at: new Date().toISOString()
  });

  if (error) return { error: error.message };

  refresh(customerId);
  return { success: "Dashboard visibility saved." };
}

// ---------------------------------------------------------------------------
// Vault boxes
// ---------------------------------------------------------------------------

export async function createBox(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const client = createAdminClient();

  const customerId = text(formData, "customer_id");
  const boxNumber = text(formData, "box_number");

  if (!customerId || !boxNumber) return { error: "A box number is required." };

  const { error } = await client.from("vault_boxes").insert({
    customer_id: customerId,
    box_number: boxNumber,
    branch: text(formData, "branch") || "Head Office",
    size: text(formData, "size") || "medium",
    status: text(formData, "status") || "active",
    visible_to_customer: bool(formData, "visible_to_customer"),
    opened_at: text(formData, "opened_at") || new Date().toISOString().slice(0, 10),
    renewal_at: optionalText(formData, "renewal_at")
  });

  if (error) return { error: error.message };

  await logActivity(customerId, admin.id, "Box assigned", `Box ${boxNumber}`, true);

  refresh(customerId);
  return { success: `Box ${boxNumber} assigned.` };
}

export async function updateBox(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const boxId = text(formData, "box_id");
  const customerId = text(formData, "customer_id");

  const { error } = await client
    .from("vault_boxes")
    .update({
      box_number: text(formData, "box_number"),
      branch: text(formData, "branch"),
      size: text(formData, "size"),
      status: text(formData, "status"),
      visible_to_customer: bool(formData, "visible_to_customer"),
      renewal_at: optionalText(formData, "renewal_at")
    })
    .eq("id", boxId);

  if (error) return { error: error.message };

  refresh(customerId);
  return { success: "Box updated." };
}

export async function deleteBox(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const { error } = await client.from("vault_boxes").delete().eq("id", text(formData, "box_id"));
  if (error) return { error: error.message };

  refresh(text(formData, "customer_id"));
  return { success: "Box removed." };
}

// ---------------------------------------------------------------------------
// Vault items
// ---------------------------------------------------------------------------

export async function createItem(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const client = createAdminClient();

  const customerId = text(formData, "customer_id");
  const name = text(formData, "name");

  if (!customerId || !name) return { error: "An item name is required." };

  const { error } = await client.from("vault_items").insert({
    customer_id: customerId,
    box_id: optionalText(formData, "box_id"),
    name,
    category: text(formData, "category") || "other",
    description: optionalText(formData, "description"),
    quantity: numberOrNull(formData, "quantity") ?? 1,
    estimated_value: numberOrNull(formData, "estimated_value"),
    currency: text(formData, "currency") || "USD",
    status: text(formData, "status") || "stored",
    visible_to_customer: bool(formData, "visible_to_customer"),
    deposited_at: text(formData, "deposited_at") || new Date().toISOString().slice(0, 10)
  });

  if (error) return { error: error.message };

  await logActivity(customerId, admin.id, "Item deposited", name, true);

  refresh(customerId);
  return { success: `${name} added to the register.` };
}

export async function updateItem(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const itemId = text(formData, "item_id");
  const customerId = text(formData, "customer_id");

  const { error } = await client
    .from("vault_items")
    .update({
      box_id: optionalText(formData, "box_id"),
      name: text(formData, "name"),
      category: text(formData, "category"),
      description: optionalText(formData, "description"),
      quantity: numberOrNull(formData, "quantity") ?? 1,
      estimated_value: numberOrNull(formData, "estimated_value"),
      currency: text(formData, "currency") || "USD",
      status: text(formData, "status"),
      visible_to_customer: bool(formData, "visible_to_customer"),
      deposited_at: text(formData, "deposited_at"),
      updated_at: new Date().toISOString()
    })
    .eq("id", itemId);

  if (error) return { error: error.message };

  refresh(customerId);
  return { success: "Item updated." };
}

export async function setItemVisibility(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const itemId = text(formData, "item_id");
  const customerId = text(formData, "customer_id");
  const visible = text(formData, "visible") === "true";

  const { error } = await client
    .from("vault_items")
    .update({ visible_to_customer: visible, updated_at: new Date().toISOString() })
    .eq("id", itemId);

  if (error) return { error: error.message };

  refresh(customerId);
  return { success: visible ? "Item published to the client." : "Item hidden from the client." };
}

export async function deleteItem(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const { error } = await client.from("vault_items").delete().eq("id", text(formData, "item_id"));
  if (error) return { error: error.message };

  refresh(text(formData, "customer_id"));
  return { success: "Item deleted." };
}

// ---------------------------------------------------------------------------
// Activity entries
// ---------------------------------------------------------------------------

export async function createActivity(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const client = createAdminClient();

  const customerId = text(formData, "customer_id");
  const action = text(formData, "action");

  if (!customerId || !action) return { error: "Describe the activity first." };

  const { error } = await client.from("activity_log").insert({
    customer_id: customerId,
    actor_id: admin.id,
    action,
    detail: optionalText(formData, "detail"),
    visible_to_customer: bool(formData, "visible_to_customer")
  });

  if (error) return { error: error.message };

  refresh(customerId);
  return { success: "Activity entry added." };
}

export async function deleteActivity(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const client = createAdminClient();

  const { error } = await client
    .from("activity_log")
    .delete()
    .eq("id", text(formData, "activity_id"));

  if (error) return { error: error.message };

  refresh(text(formData, "customer_id"));
  return { success: "Entry removed." };
}
