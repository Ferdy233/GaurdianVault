export type Role = "customer" | "admin";
export type ProfileStatus = "active" | "suspended";

export type ItemCategory =
  | "jewellery"
  | "documents"
  | "cash"
  | "metals"
  | "collectibles"
  | "electronics"
  | "other";

export type ItemStatus = "stored" | "withdrawn" | "pending" | "in_transit";
export type BoxSize = "small" | "medium" | "large" | "custom";
export type BoxStatus = "active" | "closed" | "pending";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  status: ProfileStatus;
  client_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSettings {
  customer_id: string;
  welcome_message: string;
  show_values: boolean;
  show_documents: boolean;
  show_activity: boolean;
  show_boxes: boolean;
  support_contact: string;
  updated_at: string;
}

export interface VaultBox {
  id: string;
  customer_id: string;
  box_number: string;
  branch: string;
  size: BoxSize;
  status: BoxStatus;
  visible_to_customer: boolean;
  opened_at: string;
  renewal_at: string | null;
  created_at: string;
}

export interface VaultItem {
  id: string;
  customer_id: string;
  box_id: string | null;
  name: string;
  category: ItemCategory;
  description: string | null;
  quantity: number;
  estimated_value: number | null;
  currency: string;
  status: ItemStatus;
  visible_to_customer: boolean;
  media_path: string | null;
  deposited_at: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityEntry {
  id: string;
  customer_id: string;
  actor_id: string | null;
  action: string;
  detail: string | null;
  visible_to_customer: boolean;
  created_at: string;
}

export const ITEM_CATEGORIES: ItemCategory[] = [
  "jewellery",
  "documents",
  "cash",
  "metals",
  "collectibles",
  "electronics",
  "other"
];

export const ITEM_STATUSES: ItemStatus[] = ["stored", "withdrawn", "pending", "in_transit"];
export const BOX_SIZES: BoxSize[] = ["small", "medium", "large", "custom"];
export const BOX_STATUSES: BoxStatus[] = ["active", "closed", "pending"];
