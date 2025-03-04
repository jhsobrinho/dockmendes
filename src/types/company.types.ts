export interface Company {
  id: string;
  name: string;
  document: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCreate {
  name: string;
  document: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {
  active?: boolean;
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface CompanyPaginatedResponse {
  total: number;
  pages: number;
  currentPage: number;
  companies: Company[];
}
