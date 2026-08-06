export interface CreateCategoryRequest {
  categoryName: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  categoryName?: string;
  description?: string;
}
