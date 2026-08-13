export type CategoryType = "income" | "expense";

export interface Category {
  id: number;
  user_id?: number | null;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  is_default: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  message?: string;
  data: Category[];
}