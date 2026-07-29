export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: true;
  message: string;
  meta?: ApiMeta;
  data: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}
