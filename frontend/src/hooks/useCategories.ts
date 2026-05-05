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
        
        let normalized: Category[] = [];
        if (Array.isArray(data)) {
          normalized = data;
        } else if (data && typeof data === 'object' && Array.isArray(data?.results)) {
          normalized = data.results;
        } else {
          console.warn('Unexpected categories data format:', data);
          normalized = [];
        }
        
        const filtered = normalized.filter((cat: any): cat is Category => {
          return cat && typeof cat === 'object' && cat.is_active === true;
        });
        
        setCategories(filtered);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load categories:', err);
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
