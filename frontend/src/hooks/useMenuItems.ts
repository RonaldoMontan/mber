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
      
      let normalized: MenuItem[] = [];
      if (Array.isArray(data)) {
        normalized = data;
      } else if (data && typeof data === 'object' && Array.isArray((data as any)?.results)) {
        normalized = (data as any).results;
      } else {
        console.warn('Unexpected menu data format:', data);
        normalized = [];
      }
      
      const filtered = normalized
        .filter((item: any): item is MenuItem => {
          return item && typeof item === 'object' && item.is_active === true;
        });
      
      setItems(filtered);
    } catch (err: any) {
      console.error('Erro ao buscar itens do menu:', err);
      setError(err.message || 'Erro ao carregar menu');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
};
