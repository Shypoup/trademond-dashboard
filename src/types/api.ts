export type BilingualText = string | { en: string; ar: string };

export interface Tag {
  id: string | number;
  name: BilingualText;
}

export interface Category {
  id: string | number;
  name: BilingualText;
  image?: string;
  active?: boolean;
}

export interface Product {
  id: string;
  name: BilingualText;
  description?: BilingualText;
  sku?: string;
  category_id?: string;
  company_id?: string;
  category?: {
    id: string;
    name: BilingualText;
  };
  company?: {
    id: string;
    name: BilingualText;
  };
  tags?: Tag[];
  status: 'Approved' | 'Pending' | 'Rejected' | 'Suspended';
  active: boolean;
  published: boolean;
  views?: string | number;
  price?: string | number;
  updated_at?: string;
  updated?: string;
  premium?: boolean;
  image?: string;
  profilePhoto?: string | null;
}

export interface Company {
  id: string | number;
  name: BilingualText;
  acronym?: string;
  slogan?: BilingualText;
  about?: BilingualText;
  location?: string;
  profilePhoto?: string | null;
  coverPhoto?: string | null;
  status?: string;
  active?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string | number;
  company_id?: string | number;
  category_id?: string | number;
  name: BilingualText;
  description?: BilingualText;
  tags?: Tag[];
  profilePhoto?: string | null;
  searchable?: boolean;
  active?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
  company?: {
    id: string | number;
    name: BilingualText;
  };
  category?: {
    id: string | number;
    name: BilingualText;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'Active' | 'Inactive' | 'Pending' | 'Banned' | 'Active Now';
  last_login?: string;
  lastLogin?: string; // For mock compatibility
  avatar?: string;
  image?: string;
  phone?: string;
  jobTitle?: string;
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
  };
}

export interface UserProfileResponse {
  data: {
    id: string;
    attributes: {
      name: string;
      email: string;
      profilePhoto: string | null;
      role?: string;
      phone?: string;
      jobTitle?: string;
    };
  };
}

export interface ApiResponse<T> {
  data: T[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export interface PlatformStats {
  total_users: number;
  active_users: number;
  total_companies: number;
  pending_approvals: number;
  total_products: number;
  revenue: number;
  growth: {
    users: number;
    revenue: number;
  };
}

// ─── Admin API Types ───────────────────────────────────────

export interface Plan {
  id: string;
  slug: string;
  name: BilingualText;
  description?: BilingualText;
  level: number;
  price_monthly?: number;
  price_yearly?: number;
  active: boolean;
  is_default?: boolean;
  features?: PlanFeature[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PlanFeature {
  id: string;
  enabled: boolean;
  limit?: number | null;
  tier?: string | null;
  config?: Record<string, unknown> | null;
}

export interface Feature {
  id: string;
  key: string;
  type: 'boolean' | 'limit' | 'tier' | 'config';
  name: BilingualText;
  description?: BilingualText;
  category: string;
  active: boolean;
  depends_on?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_ulid?: string;
  company_ulid?: string;
  plan_ulid?: string;
  plan?: Plan;
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'pending';
  billing_cycle: 'monthly' | 'yearly';
  starts_at?: string;
  expires_at?: string;
  trial_ends_at?: string | null;
  payment_reference?: string | null;
  amount_paid?: number | null;
  currency?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Entitlement {
  id: string;
  company_ulid: string;
  feature_key: string;
  type: 'slot' | 'credit' | 'boolean';
  starts_at?: string;
  expires_at?: string;
  slots_total?: number | null;
  slots_used?: number | null;
  credits_total?: number | null;
  credits_used?: number | null;
  payment_reference?: string | null;
  amount_paid?: number | null;
  currency?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeatureOverride {
  id: string;
  company_ulid: string;
  feature_key: string;
  enabled: boolean;
  limit?: number | null;
  tier?: string | null;
  config?: Record<string, unknown> | null;
  reason?: string;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Experiment {
  id: string;
  feature_key: string;
  name: string;
  description?: string;
  targeting_type: 'percentage' | 'rules';
  targeting_rules?: Record<string, unknown> | null;
  rollout_percentage?: number;
  enabled: boolean;
  limit?: number | null;
  tier?: string | null;
  config?: Record<string, unknown> | null;
  active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Media {
  id: string; // UUID
  model_type?: string;
  model_id?: string;
  collection_name?: string;
  name?: string;
  file_name?: string;
  mime_type?: string;
  disk?: string;
  size?: number;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  user_id?: string;
  reviewable_type?: string;
  reviewable_id?: string;
  rating: number;
  comment?: string;
  owner_reply?: string | null;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Follow {
  id: string;
  user_id: string;
  followable_type: string;
  followable_id: string;
  created_at?: string;
}

export interface Like {
  id: string;
  user_id: string;
  likeable_type: string;
  likeable_id: string;
  created_at?: string;
}

export interface CuratedList {
  id: string;
  name: BilingualText;
  headline?: BilingualText;
  description?: BilingualText;
  type: 'companies' | 'products' | 'services';
  slug: string;
  position?: number;
  max_items?: number;
  active: boolean;
  published?: boolean;
  items?: CuratedListItem[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CuratedListItem {
  id: string;
  curated_list_id: string;
  item_id: string;
  position: number;
  created_at?: string;
}

export interface Sponsorship {
  id: string;
  company_id: string;
  keyword: string;
  entity_type: 'company' | 'product' | 'service';
  entity_id?: string | null;
  position?: number;
  amount_paid?: number;
  status?: string;
  starts_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TagProposal {
  id: string;
  name: BilingualText;
  proposed_by?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'merged';
  canonical_tag_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SearchIndex {
  name: string;
  count?: number;
  last_indexed_at?: string;
}
