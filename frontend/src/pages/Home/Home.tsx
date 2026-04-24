import { useEffect, useState } from 'react';
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
  const hasDailyDishImage = Boolean(dailyDish?.image && dailyDish.image.trim() !== '');

  const availableToday = items.filter(item => {
    if (!item.weekdays || item.weekdays.length === 0) return true;
    return item.weekdays.includes(currentWeekday as any);
  });

  const menuItems = availableToday.filter((item) => {
    if (dailyDish?.id && item.id === dailyDish.id) {
      return false;
    }

    if (!selectedCategory) {
      return true;
    }

    return item.categories_detail?.some((cat: CategoryDetail) => cat.code === selectedCategory);
  });

  const isDrinkItem = (item: { categories_detail?: CategoryDetail[] }) =>
    item.categories_detail?.some((cat: CategoryDetail) => cat.code === 'bebidas') ?? false;

  const mainMenuItems = menuItems.filter((item) => !isDrinkItem(item));
  const drinksMenuItems = menuItems.filter((item) => isDrinkItem(item));
  const isGeneralMenuView = selectedCategory === null;
  const isDrinksView = selectedCategory === 'bebidas';

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <main className="flex-1 md:ml-80 pt-20 md:pt-12 pb-24 md:pb-12 px-4 md:px-12 flex flex-col items-center">
        {import.meta.env.DEV && (
          <div className="w-full max-w-4xl mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-800">
            debug: itens={items.length} | disponiveisHoje={availableToday.length} | menuExibido={menuItems.length} | pratoDia={dailyDish?.name || 'nenhum'} | pratos={mainMenuItems.length} | bebidas={drinksMenuItems.length}
          </div>
        )}

        {scheduleError && (
          <div className="w-full max-w-4xl mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {scheduleError}
          </div>
        )}

        {!isDrinksView && todaySchedule && !todaySchedule.is_open ? (
          <section className="w-full max-w-4xl mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-red-700">Programacao de hoje</p>
            <h2 className="mt-2 text-2xl font-black text-red-700">Hoje estamos fechados</h2>
            <p className="mt-2 text-sm text-gray-600">{todaySchedule.note || 'Sem atendimento para a data de hoje.'}</p>
          </section>
        ) : null}

        {!isDrinksView && todaySchedule && todaySchedule.is_open && !dailyDish ? (
          <section className="w-full max-w-4xl mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-red-700">Programacao de hoje</p>
            <h2 className="mt-2 text-2xl font-black text-red-700">Sem prato do dia programado</h2>
            <p className="mt-2 text-sm text-gray-600">
              {todaySchedule.note || 'Infelizmente nao temos prato do dia disponivel hoje. Confira as outras opcoes do cardapio.'}
            </p>
          </section>
        ) : null}

        {!isDrinksView && todaySchedule && todaySchedule.is_open && dailyDish ? (
          <section className="w-full max-w-5xl mb-10 overflow-hidden rounded-3xl border-4 border-[#FFC107]/50 bg-gradient-to-br from-[#B22222] via-[#A41111] to-[#7D0000] text-white shadow-2xl">
            <div className="flex flex-col md:min-h-[320px] md:flex-row">
              <div className="relative md:w-[48%]">
                {hasDailyDishImage ? (
                  <img
                    src={dailyDish.image}
                    alt={dailyDish.name}
                    className="h-64 w-full object-cover md:h-full"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-black/20 px-6 text-center text-sm text-white/80 md:h-full">
                    Imagem do prato nao cadastrada
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#FFD54F]">Prato do dia</p>
                  <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">{dailyDish.name}</h2>
                  {dailyDish.side_dish ? (
                    <p className="mt-4 max-w-xl text-base text-white/90 md:text-lg">{dailyDish.side_dish}</p>
                  ) : null}
                  {todaySchedule.note ? (
                    <p className="mt-3 text-sm text-[#FFD54F]/90">{todaySchedule.note}</p>
                  ) : null}
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Oferta especial de hoje</p>
                  {dailyDishPrice ? (
                    <div className="rounded-2xl bg-[#FFC107] px-6 py-3 text-right shadow-lg">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8B0000]">Somente hoje</p>
                      <p className="text-3xl font-black text-[#8B0000]">R$ {Number(dailyDishPrice).toFixed(2)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {menuItems.length === 0 ? (
          <p className="text-center text-gray-400 text-xl">Nenhum item disponivel hoje no cardapio principal.</p>
        ) : isGeneralMenuView ? (
          <section className="w-full max-w-4xl">
            <h1 className="text-5xl font-black text-[#B22222] mb-8 uppercase italic text-center">Cardapio</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mainMenuItems.map((item) => (
                <MenuItemCard key={item.id} item={item} variant="highlight" />
              ))}
            </div>
          </section>
        ) : (
          <section className="w-full max-w-4xl">
            <h1 className="text-5xl font-black text-[#B22222] mb-8 uppercase italic text-center">
              {categories.find((c) => c.code === selectedCategory)?.name || 'Cardapio'}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard key={item.id} item={item} variant="highlight" />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
