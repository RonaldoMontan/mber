import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components';
import { menu, schedule } from '../../../api';
import type { MenuItem } from '../../../api/menu/menu.types';
import type { MenuItemSchedule } from '../../../api/schedule/schedule.types';

interface ScheduleFormItem {
  id?: number;
  date: string;
  weekday: string;
  is_open: boolean;
  item_id: string;
  daily_price: string;
  note: string;
}

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonday = (): Date => {
  const today = new Date();
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getWeekRange = (mode: 'current' | 'next' | 'previous') => {
  const monday = getCurrentMonday();
  const base = new Date(monday);

  if (mode === 'next') {
    base.setDate(base.getDate() + 7);
  }

  if (mode === 'previous') {
    base.setDate(base.getDate() - 7);
  }

  const end = new Date(base);
  end.setDate(base.getDate() + 6);

  return {
    startDate: formatDate(base),
    endDate: formatDate(end),
  };
};

const getWeekDates = (weekMode: 'current' | 'next') => {
  const monday = getCurrentMonday();
  const base = new Date(monday);

  if (weekMode === 'next') {
    base.setDate(base.getDate() + 7);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return date;
  });
};

const Schedule = () => {
  const [weekMode, setWeekMode] = useState<'current' | 'next'>('current');
  const [scheduleRows, setScheduleRows] = useState<ScheduleFormItem[]>([]);
  const [specialOptions, setSpecialOptions] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const headerDescription = useMemo(() => {
    return weekMode === 'current'
      ? 'Programe os pratos da semana atual'
      : 'Programe os pratos da próxima semana';
  }, [weekMode]);

  const loadSpecialOptions = async () => {
    const response = await menu.getMenuItems({ special_candidates: true, is_active: true });
    setSpecialOptions(response);
  };

  const hydrateSchedule = (weekDates: Date[], scheduleData: MenuItemSchedule[]) => {
    const byDate = new Map(scheduleData.map((item) => [item.date, item]));

    const hydrated: ScheduleFormItem[] = weekDates.map((date) => {
      const key = formatDate(date);
      const existing = byDate.get(key);

      return {
        id: existing?.id,
        date: key,
        weekday: weekdayLabels[date.getDay()],
        is_open: existing ? existing.is_open : true,
        item_id: existing?.item?.id ? String(existing.item.id) : '',
        daily_price: existing?.daily_price ? String(existing.daily_price) : '',
        note: existing?.note || '',
      };
    });

    setScheduleRows(hydrated);
  };

  const loadSchedules = async () => {
    const weekDates = getWeekDates(weekMode);
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[weekDates.length - 1]);
    const scheduleData = await schedule.getSchedules({ start_date: startDate, end_date: endDate });
    hydrateSchedule(weekDates, scheduleData);
  };

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      await Promise.all([loadSpecialOptions(), loadSchedules()]);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      setMessage('Nao foi possivel carregar a agenda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekMode]);

  const handleScheduleChange = (
    date: string,
    field: keyof Pick<ScheduleFormItem, 'is_open' | 'item_id' | 'daily_price' | 'note'>,
    value: boolean | string
  ) => {
    setScheduleRows((currentRows) =>
      currentRows.map((row) => {
        if (row.date !== date) {
          return row;
        }

        if (field === 'is_open' && value === false) {
          return { ...row, is_open: false, item_id: '' };
        }

        return { ...row, [field]: value };
      })
    );
  };

  const copyFromPreviousWeek = async () => {
    setMessage('');

    try {
      const sourceMode = weekMode === 'next' ? 'current' : 'previous';
      const sourceRange = getWeekRange(sourceMode);
      const sourceItems = await schedule.getSchedules({
        start_date: sourceRange.startDate,
        end_date: sourceRange.endDate,
      });

      if (!sourceItems.length) {
        setMessage('Nao ha agenda na semana anterior para copiar.');
        return;
      }

      const byWeekday: Record<number, MenuItemSchedule> = {};
      sourceItems.forEach((item) => {
        const weekday = new Date(`${item.date}T00:00:00`).getDay();
        byWeekday[weekday] = item;
      });

      setScheduleRows((currentRows) =>
        currentRows.map((row) => {
          const weekday = new Date(`${row.date}T00:00:00`).getDay();
          const source = byWeekday[weekday];

          if (!source) {
            return row;
          }

          return {
            ...row,
            is_open: source.is_open,
            item_id: source.item?.id ? String(source.item.id) : '',
            daily_price: source.daily_price ? String(source.daily_price) : '',
            note: source.note || '',
          };
        })
      );

      setMessage('Dados da semana anterior copiados. Clique em Salvar semana para confirmar.');
    } catch (error) {
      console.error('Erro ao copiar semana:', error);
      setMessage('Nao foi possivel copiar os dados da semana anterior.');
    }
  };

  const saveAllSchedules = async () => {
    setIsSaving(true);
    setMessage('');

    const invalidRow = scheduleRows.find((row) => row.is_open && !row.item_id);
    if (invalidRow) {
      setMessage(`Selecione um prato para ${invalidRow.weekday} antes de salvar.`);
      setIsSaving(false);
      return;
    }

    try {
      await schedule.bulkUpsertSchedules({
        schedules: scheduleRows.map((row) => ({
          date: row.date,
          is_open: row.is_open,
          item_id: row.is_open ? Number(row.item_id) : null,
          daily_price: row.daily_price || null,
          note: row.note,
        })),
      });

      setMessage('Agenda da semana salva com sucesso.');
      await loadSchedules();
    } catch (error) {
      console.error('Erro ao salvar agenda:', error);
      setMessage('Falha ao salvar agenda da semana. Verifique os dados e tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Agenda do Prato do Dia"
        description={headerDescription}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <select
          value={weekMode}
          onChange={(event) => setWeekMode(event.target.value as 'current' | 'next')}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
        >
          <option value="current">Semana atual</option>
          <option value="next">Proxima semana</option>
        </select>

        <button
          type="button"
          onClick={copyFromPreviousWeek}
          disabled={isLoading || isSaving}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Copiar semana anterior
        </button>

        <button
          type="button"
          onClick={saveAllSchedules}
          disabled={isLoading || isSaving}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Salvando semana...' : 'Salvar semana'}
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {scheduleRows.map((row) => (
            <article key={row.date} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[100px_160px_1fr] md:items-center">
                <div>
                  <p className="text-sm font-bold text-red-700">{row.weekday}</p>
                  <p className="text-xs text-gray-500">{row.date}</p>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={row.is_open}
                    onChange={(event) => handleScheduleChange(row.date, 'is_open', event.target.checked)}
                  />
                  Dia aberto
                </label>

                <div className="grid gap-2 md:grid-cols-[1fr_180px_1fr]">
                  <select
                    value={row.item_id}
                    onChange={(event) => handleScheduleChange(row.date, 'item_id', event.target.value)}
                    disabled={!row.is_open}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">Selecione o prato</option>
                    {specialOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.daily_price}
                    onChange={(event) => handleScheduleChange(row.date, 'daily_price' as any, event.target.value)}
                    placeholder="Valor do dia"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
                  />

                  <input
                    type="text"
                    value={row.note}
                    onChange={(event) => handleScheduleChange(row.date, 'note', event.target.value)}
                    placeholder="Observacao (opcional)"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
