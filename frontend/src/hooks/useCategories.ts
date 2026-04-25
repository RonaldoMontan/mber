import { useState, useEffect } from 'react';
import api from '../api/axios.config';

export interface Category {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await api.get<Category[] | { results?: Category[] }>('/api/categories/?is_active=true');
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];
        setCategories(normalized);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar categorias');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
