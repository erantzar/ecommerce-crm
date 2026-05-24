import axios from 'axios';
import type { ParsedApiError, ValidationError } from '@/types';

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    if (status === 422 && Array.isArray(data?.data)) {
      return {
        message: data.message ?? 'Validation error',
        statusCode: 422,
        isValidation: true,
        validationErrors: data.data as ValidationError[],
      };
    }

    return {
      message: data?.message ?? error.message ?? 'Request failed',
      statusCode: status,
      isValidation: false,
      validationErrors: [],
    };
  }

  return {
    message: 'Network error. Please check your connection.',
    statusCode: 0,
    isValidation: false,
    validationErrors: [],
  };
}
