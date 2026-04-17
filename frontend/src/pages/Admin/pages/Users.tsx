import { useState, useEffect } from 'react';
import { PageHeader } from '../components';
import { Modal, Button, Input, ConfirmDialog } from '../../../components';
import { users, auth as authApi } from '../../../api';
import { useAuth } from '../../../hooks';
import type { User } from '../../../api/auth/auth.types';

const USER_GROUPS = [
  { value: 'Manager', label: 'Manager', description: 'Acesso completo ao sistema' },
  { value: 'Editor', label: 'Editor', description: 'Pode criar e editar conteúdo' },
  { value: 'Viewer', label: 'Viewer', description: 'Apenas visualização' },
];

interface FormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  groups: string[];
  is_active: boolean;
}

const Users = () => {
  const { user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    groups: [],
    is_active: true,
  });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: number | null; userName: string }>({ isOpen: false, userId: null, userName: '' });

  const isManager = currentUser?.groups?.includes('Manager');

  useEffect(() => {
    if (isManager) {
      loadUsers();
    }
  }, [isManager]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await users.getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: '',
        password2: '',
        groups: user.groups,
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: '',
        groups: ['Viewer'],
        is_active: true,
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!editingUser && formData.password !== formData.password2) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      if (editingUser) {
        const payload = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          groups: formData.groups,
          is_active: formData.is_active,
        };
        await users.updateUser(editingUser.id, payload);
      } else {
        const payload = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          password2: formData.password2,
          groups: formData.groups,
        };
        await authApi.register(payload);
      }
      await loadUsers();
      handleCloseModal();
    } catch (err: any) {
      const errorMsg = err?.data?.username?.[0] || err?.data?.password?.[0] || err?.message || 'Erro ao salvar usuário';
      setError(errorMsg);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ isOpen: true, userId: id, userName: name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.userId) return;

    try {
      await users.deleteUser(deleteConfirm.userId);
      await loadUsers();
      setDeleteConfirm({ isOpen: false, userId: null, userName: '' });
    } catch (err) {
      alert('Erro ao excluir usuário');
    }
  };

  const toggleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      groups: [group],
    }));
  };

  if (!isManager) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários do sistema (apenas Manager)"
        action={
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="hidden sm:inline">Adicionar Usuário</span>
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
          <div className="lg:hidden space-y-3">
            {usersList.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                Nenhum usuário cadastrado
              </div>
            ) : (
              usersList.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">@{user.username}</p>
                      <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.groups.includes('Manager')
                        ? 'bg-purple-100 text-purple-800'
                        : user.groups.includes('Editor')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.groups[0] || 'Sem grupo'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Editar
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteClick(user.id, user.username)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Excluir
                      </button>
                    )}
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
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
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
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum usuário cadastrado
                    </td>
                  </tr>
                ) : (
                  usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.groups.includes('Manager')
                            ? 'bg-purple-100 text-purple-800'
                            : user.groups.includes('Editor')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.groups[0] || 'Sem grupo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteClick(user.id, user.username)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          )}
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
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome"
              placeholder="João"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Sobrenome"
              placeholder="Silva"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <Input
            label="Nome de Usuário"
            placeholder="joao.silva"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={!!editingUser}
          />

          <Input
            label="Email"
            type="email"
            placeholder="joao@exemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          {!editingUser && (
            <>
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="••••••••"
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                required
              />
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupo de Permissões
            </label>
            <div className="space-y-2">
              {USER_GROUPS.map(group => (
                <button
                  key={group.value}
                  type="button"
                  onClick={() => toggleGroup(group.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    formData.groups.includes(group.value)
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{group.label}</p>
                      <p className="text-xs text-gray-500">{group.description}</p>
                    </div>
                    {formData.groups.includes(group.value) && (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {editingUser && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Usuário ativo
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleCloseModal} variant="secondary" fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {editingUser ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${deleteConfirm.userName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Users;
