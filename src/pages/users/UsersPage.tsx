import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { UserList } from '../../components/users/UserList';
import { UserForm } from '../../components/users/UserForm';
import { useUserStore } from '../../store/userStore';
import { UserCreate, UserUpdate } from '../../types';

export const UsersPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { selectedUser, createUser, updateUser, setSelectedUser } = useUserStore();

  const handleSubmit = async (data: UserCreate | UserUpdate) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, data);
      } else {
        await createUser(data as UserCreate);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  return (
    <Layout title="Usuários">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <button
            onClick={handleNewUser}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Usuário
          </button>
        </div>

        {isFormOpen || selectedUser ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <UserForm
                user={selectedUser}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        ) : (
          <UserList />
        )}
      </div>
    </Layout>
  );
};
