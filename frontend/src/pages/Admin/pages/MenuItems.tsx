import { useState, useEffect } from 'react';
import { PageHeader } from '../components';
import { Modal, Button, Input, ConfirmDialog } from '../../../components';
import { menu } from '../../../api';
import type { MenuItem, CategoryDetail } from '../../../api/menu/menu.types';

const WEEKDAYS = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

interface FormData {
  name: string;
  side_dish: string;
  image: string;
  category_codes: string[];
  lunch_box_price_small: string;
  lunch_box_price_medium: string;
  lunch_box_price_large: string;
  daily_plate_price: string;
  weekdays: string[];
  is_active: boolean;
}

const MenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    side_dish: '',
    image: '',
    category_codes: [],
    lunch_box_price_small: '',
    lunch_box_price_medium: '',
    lunch_box_price_large: '',
    daily_plate_price: '',
    weekdays: [],
    is_active: true,
  });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: number | null; itemName: string }>({ isOpen: false, itemId: null, itemName: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        menu.getMenuItems(),
        menu.getCategories(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData.filter(c => c.is_active));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        side_dish: item.side_dish || '',
        image: item.image || '',
        category_codes: item.categories_detail?.map(c => c.code) || [],
        lunch_box_price_small: item.lunch_box_price_small || '',
        lunch_box_price_medium: item.lunch_box_price_medium || '',
        lunch_box_price_large: item.lunch_box_price_large || '',
        daily_plate_price: item.daily_plate_price || '',
        weekdays: item.weekdays || [],
        is_active: item.is_active ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        side_dish: '',
        image: '',
        category_codes: [],
        lunch_box_price_small: '',
        lunch_box_price_medium: '',
        lunch_box_price_large: '',
        daily_plate_price: '',
        weekdays: [],
        is_active: true,
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hasPrice = formData.lunch_box_price_small || formData.lunch_box_price_medium || 
                     formData.lunch_box_price_large || formData.daily_plate_price;
    
    if (!hasPrice) {
      setError('Pelo menos um preço deve ser informado');
      return;
    }

    try {
      const payload = {
        ...formData,
        lunch_box_price_small: formData.lunch_box_price_small || undefined,
        lunch_box_price_medium: formData.lunch_box_price_medium || undefined,
        lunch_box_price_large: formData.lunch_box_price_large || undefined,
        daily_plate_price: formData.daily_plate_price || undefined,
      };

      if (editingItem) {
        await menu.updateMenuItem(editingItem.id, payload as any);
      } else {
        await menu.createMenuItem(payload as any);
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      setError(err?.data?.detail || err?.message || 'Erro ao salvar item');
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ isOpen: true, itemId: id, itemName: name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.itemId) return;

    try {
      await menu.deleteMenuItem(deleteConfirm.itemId);
      await loadData();
      setDeleteConfirm({ isOpen: false, itemId: null, itemName: '' });
    } catch (err) {
      alert('Erro ao excluir item');
    }
  };

  const toggleWeekday = (weekday: string) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(weekday)
        ? prev.weekdays.filter(w => w !== weekday)
        : [...prev.weekdays, weekday],
    }));
  };

  const toggleCategory = (code: string) => {
    setFormData(prev => ({
      ...prev,
      category_codes: prev.category_codes.includes(code)
        ? prev.category_codes.filter(c => c !== code)
        : [...prev.category_codes, code],
    }));
  };

  return (
    <div>
      <PageHeader
        title="Cardápio"
        description="Gerencie os itens do seu cardápio"
        action={
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Adicionar Prato</span>
            <span className="sm:hidden">Adicionar</span>
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="lg:hidden space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                Nenhum item cadastrado
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      {item.side_dish && (
                        <p className="text-xs text-gray-500 line-clamp-2">{item.side_dish}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {item.categories_detail && item.categories_detail.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Categorias</p>
                      <div className="flex flex-wrap gap-1">
                        {item.categories_detail.map(cat => (
                          <span key={cat.id} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Preços</p>
                    <div className="space-y-2">
                      {(item.lunch_box_price_small || item.lunch_box_price_medium || item.lunch_box_price_large) && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Marmitas</p>
                          <div className="flex flex-wrap gap-1">
                            {item.lunch_box_price_small && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                                P: R$ {item.lunch_box_price_small}
                              </span>
                            )}
                            {item.lunch_box_price_medium && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                                M: R$ {item.lunch_box_price_medium}
                              </span>
                            )}
                            {item.lunch_box_price_large && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                                G: R$ {item.lunch_box_price_large}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {item.daily_plate_price && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Prato do Dia</p>
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded">
                            R$ {item.daily_plate_price}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id, item.name)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preços
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum item cadastrado
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            {item.side_dish && (
                              <p className="text-xs text-gray-500 mt-1">{item.side_dish}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.categories_detail?.map(cat => (
                            <span key={cat.id} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {(item.lunch_box_price_small || item.lunch_box_price_medium || item.lunch_box_price_large) && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-1">Marmitas</p>
                              <div className="flex flex-wrap gap-1">
                                {item.lunch_box_price_small && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                    P: R$ {item.lunch_box_price_small}
                                  </span>
                                )}
                                {item.lunch_box_price_medium && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                    M: R$ {item.lunch_box_price_medium}
                                  </span>
                                )}
                                {item.lunch_box_price_large && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                    G: R$ {item.lunch_box_price_large}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {item.daily_plate_price && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-1">Prato do Dia</p>
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                R$ {item.daily_plate_price}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Item' : 'Novo Item'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Nome do Prato *"
                placeholder="Ex: Feijoada Completa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acompanhamentos
              </label>
              <textarea
                placeholder="Ex: Arroz, feijão, farofa, couve, laranja"
                value={formData.side_dish}
                onChange={(e) => setFormData({ ...formData, side_dish: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="URL da Imagem"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorias
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.code)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.category_codes.includes(cat.code)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 border-t pt-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">💰 Preços</h3>
              <p className="text-sm text-gray-600 mb-4">Preencha pelo menos um tipo de preço</p>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Marmitas (Lunch Box)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Pequena"
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={formData.lunch_box_price_small}
                      onChange={(e) => setFormData({ ...formData, lunch_box_price_small: e.target.value })}
                    />
                    <Input
                      label="Média"
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={formData.lunch_box_price_medium}
                      onChange={(e) => setFormData({ ...formData, lunch_box_price_medium: e.target.value })}
                    />
                    <Input
                      label="Grande"
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={formData.lunch_box_price_large}
                      onChange={(e) => setFormData({ ...formData, lunch_box_price_large: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Prato do Dia
                  </h4>
                  <div className="max-w-xs">
                    <Input
                      label="Preço"
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={formData.daily_plate_price}
                      onChange={(e) => setFormData({ ...formData, daily_plate_price: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias Disponíveis (vazio = todos os dias)
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.weekdays.includes(day.value)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Item ativo no cardápio
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" onClick={handleCloseModal} variant="secondary" fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {editingItem ? 'Salvar Alterações' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, itemId: null, itemName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Item"
        message={`Tem certeza que deseja excluir "${deleteConfirm.itemName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default MenuItems;
