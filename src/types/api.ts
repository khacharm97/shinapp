export interface ContactRequestPayload {
  name?: string;
  phone?: string;
  description?: string;
  email?: string;
  services?: string;
  estimatedCost?: string;
  notes?: string;
  firstName?: string;
  lastName?: string;
  contact?: boolean;
}

export interface EstimateEmailPayload {
  recipients: string[];
  subject: string;
  message: string;
  firstName: string;
  lastName: string;
  columns: string[];
  rows: Record<string, string | number>[];
  lang: string;
}

export interface ContactEmailPayload {
  recipients: string[];
  firstName: string;
  lastName: string;
  lang: string;
}

export interface BasicApiResponse {
  success?: boolean;
  message?: string;
}

export interface MastersQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  regionId?: string;
  cityId?: string;
  topRated?: boolean;
  availableNow?: boolean;
  sortBy?: 'relevance' | 'rating';
}
