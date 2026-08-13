import api from "./axios";

import type {
  CategoriesResponse,
  Category,
  CategoryType,
} from "../types/category";

export const getCategories = async (
  type?: CategoryType,
): Promise<Category[]> => {
  const response =
    await api.get<CategoriesResponse>("/categories");

  const categories = response.data.data ?? [];

  if (!type) {
    return categories;
  }

  return categories.filter(
    (category) => category.type === type,
  );
};