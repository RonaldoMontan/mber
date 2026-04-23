import { useState, useEffect, useCallback } from 'react';
import { menu } from '../api';
import { MenuItem } from '../types';

export const useMenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menu.getMenuItems({ ordering: 'name' });
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.results)
          ? (data as any).results
          : [];
      setItems(normalized.filter((item: MenuItem) => item.is_active));
    } catch (err: any) {
      console.error('Erro ao buscar itens do menu:', err);
      setError(err.message || 'Erro ao carregar menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
};
