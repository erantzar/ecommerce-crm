export type ProductCategory = 'electronics' | 'clothing' | 'food' | 'home' | 'beauty';

export interface ProductRating {
  _id: string;
  /** Populated by the backend — always returns { _id, name } when fetched via GET /products/:id */
  user: string | { _id: string; name: string };
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  sold?: number;
  isActive?: boolean;
  averageRating?: number;
  ratings?: ProductRating[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  images: File[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
}
