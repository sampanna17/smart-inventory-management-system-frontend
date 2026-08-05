export interface Category {
  categoryID: number;
  categoryName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  categoryName?: string;
  description?: string;
}
