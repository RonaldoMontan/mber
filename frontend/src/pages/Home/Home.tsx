import { useState } from 'react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { Loading, ErrorMessage } from '../../components';
import { Sidebar, MenuItemCard } from './components';
import { CategoryDetail } from '../../api/menu/menu.types';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { items, loading, error } = useMenuItems();
  const { categories } = useCategories();

  if (loading) {
    return <Loading message="Carregando cardápio..." />;
  }

  if (error) {
    return <ErrorMessage message={`Erro: ${error}`} fullScreen />;
  }

  const getCurrentWeekday = (): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const currentWeekday = getCurrentWeekday();

  let availableToday = items.filter(item => {
    if (!item.weekdays || item.weekdays.length === 0) return true;
    return item.weekdays.includes(currentWeekday as any);
  });

  // Filtrar por categoria selecionada
  if (selectedCategory) {
    availableToday = availableToday.filter(item => 
      item.categories_detail?.some((cat: CategoryDetail) => cat.code === selectedCategory)
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <main className="flex-1 md:ml-80 pt-20 md:pt-12 pb-24 md:pb-12 px-4 md:px-12 flex flex-col items-center">
        {availableToday.length > 0 ? (
          <section className="w-full max-w-4xl">
            <h1 className="text-5xl font-black text-[#B22222] mb-8 uppercase italic text-center">
              {selectedCategory && categories ? categories.find((c) => c.code === selectedCategory)?.name || 'Cardápio' : 'Cardápio'}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableToday.map((item) => (
                <MenuItemCard key={item.id} item={item} variant="highlight" />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-gray-400 text-xl">Nenhum item disponível hoje.</p>
        )}
      </main>
    </div>
  );
};

export default Home;
