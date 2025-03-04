import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { User } from '../../types';
import { useUserStore } from '../../store/userStore';
import { UserCard } from './UserCard';

export const UserList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  const {
    users,
    totalCount,
    currentPage,
    totalPages,
    loading,
    error,
    fetchUsers,
    deleteUser,
    updateUser,
    resetPassword,
    setSelectedUser
  } = useUserStore();

  useEffect(() => {
    loadUsers();
  }, [currentPage, search, showInactive]);

  const loadUsers = () => {
    fetchUsers({
      page: currentPage,
      limit: 10,
      search,
      active: !showInactive ? true : undefined
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Deseja realmente excluir o usuário ${user.name}?`)) {
      await deleteUser(user.id);
      loadUsers();
    }
  };

  const handleToggleActive = async (user: User) => {
    await updateUser(user.id, { active: !user.active });
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = window.prompt('Digite a nova senha:');
    if (newPassword) {
      try {
        await resetPassword(user.id, newPassword);
        alert('Senha alterada com sucesso!');
      } catch (error) {
        alert('Erro ao alterar senha');
      }
    }
  };

  if (loading && users.length === 0) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar usuários: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={search}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full border rounded-md"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Mostrar inativos</span>
          </label>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onResetPassword={handleResetPassword}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchUsers({ page, search, active: !showInactive ? true : undefined })}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
