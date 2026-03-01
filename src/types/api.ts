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
