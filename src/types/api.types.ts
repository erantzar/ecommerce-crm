export type ApiStatus = 'success' | 'fail' | 'error';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalProducts?: number;
  totalOrders?: number;
}

export interface ApiResponse<T> {
  status: ApiStatus | number;
  message?: string;
  results?: number;
  pagination?: PaginationMeta;
  data: T;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status: 'fail' | 'error' | 422;
  message: string;
  data?: ValidationError[];
}

export interface ParsedApiError {
  message: string;
  statusCode: number;
  isValidation: boolean;
  validationErrors: ValidationError[];
}
