import { useEffect, useMemo, useState } from 'react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { schedule } from '../../api';
import { Loading, ErrorMessage } from '../../components';
import { Sidebar, MenuItemCard } from './components';
import { CategoryDetail } from '../../api/menu/menu.types';
import type { MenuItemSchedule } from '../../api/schedule/schedule.types';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { items, loading, error } = useMenuItems();
  const { categories } = useCategories();
  const [todaySchedule, setTodaySchedule] = useState<MenuItemSchedule | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    const loadTodaySchedule = async () => {
      try {
        const data = await schedule.getTodaySchedule();
        setTodaySchedule(data);
      } catch (err: any) {
        setScheduleError(err?.message || 'Nao foi possivel carregar o prato do dia.');
      }
    };

    loadTodaySchedule();
  }, []);

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
  const dailyDish = todaySchedule?.item || null;
  const dailyDishPrice = todaySchedule?.daily_price || dailyDish?.daily_plate_price || null;

  const availableToday = items.filter(item => {
    if (!item.weekdays || item.weekdays.length === 0) return true;
    return item.weekdays.includes(currentWeekday as any);
  });

  const menuItems = useMemo(() => {
    let filtered = availableToday.filter((item) => {
      if (dailyDish?.id && item.id === dailyDish.id) {
        return false;
      }

      if (!selectedCategory) {
        return true;
      }

      return item.categories_detail?.some((cat: CategoryDetail) => cat.code === selectedCategory);
    });

    return filtered;
  }, [availableToday, selectedCategory, dailyDish]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <main className="flex-1 md:ml-80 pt-20 md:pt-12 pb-24 md:pb-12 px-4 md:px-12 flex flex-col items-center">
        {import.meta.env.DEV && (
          <div className="w-full max-w-4xl mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-800">
            debug: itens={items.length} | disponiveisHoje={availableToday.length} | menuExibido={menuItems.length} | pratoDia={dailyDish?.name || 'nenhum'}
          </div>
        )}

        {scheduleError && (
          <div className="w-full max-w-4xl mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {scheduleError}
          </div>
        )}

        {todaySchedule && !todaySchedule.is_open ? (
          <section className="w-full max-w-4xl mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-red-700">Programacao de hoje</p>
            <h2 className="mt-2 text-2xl font-black text-red-700">Hoje estamos fechados</h2>
            <p className="mt-2 text-sm text-gray-600">{todaySchedule.note || 'Sem atendimento para a data de hoje.'}</p>
          </section>
        ) : null}

        {todaySchedule && todaySchedule.is_open && !dailyDish ? (
          <section className="w-full max-w-4xl mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-red-700">Programacao de hoje</p>
            <h2 className="mt-2 text-2xl font-black text-red-700">Sem prato do dia programado</h2>
            <p className="mt-2 text-sm text-gray-600">
              {todaySchedule.note || 'Infelizmente nao temos prato do dia disponivel hoje. Confira as outras opcoes do cardapio.'}
            </p>
          </section>
        ) : null}

        {todaySchedule && todaySchedule.is_open && dailyDish ? (
          <section className="w-full max-w-4xl mb-8 rounded-3xl bg-gradient-to-r from-[#B22222] to-[#8B0000] p-6 text-white shadow-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#FFC107]">Prato do dia</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-black">{dailyDish.name}</h2>
                {dailyDish.side_dish ? (
                  <p className="mt-2 text-sm text-white/90">{dailyDish.side_dish}</p>
                ) : null}
                {todaySchedule.note ? (
                  <p className="mt-2 text-xs text-white/80">{todaySchedule.note}</p>
                ) : null}
              </div>
              {dailyDishPrice ? (
                <div className="rounded-xl bg-white/15 px-4 py-3 text-2xl font-black text-[#FFC107]">
                  R$ {Number(dailyDishPrice).toFixed(2)}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {menuItems.length > 0 ? (
          <section className="w-full max-w-4xl">
            <h1 className="text-5xl font-black text-[#B22222] mb-8 uppercase italic text-center">
              {selectedCategory && categories ? categories.find((c) => c.code === selectedCategory)?.name || 'Cardápio' : 'Cardápio'}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard key={item.id} item={item} variant="highlight" />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-gray-400 text-xl">Nenhum item disponivel hoje no cardapio principal.</p>
        )}
      </main>
    </div>
  );
};

export default Home;
