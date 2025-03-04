import React from 'react';
import { User } from '../../types';
import { Edit2, Trash2, Power, Key } from 'lucide-react';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActive: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onToggleActive,
  onResetPassword
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">Função:</span>{' '}
          {user.role === 'admin' ? 'Administrador' : user.role === 'operator' ? 'Operador' : 'Cliente'}
        </p>
        {user.company && (
          <p className="text-sm">
            <span className="font-medium">Empresa:</span> {user.company.name}
          </p>
        )}
        <p className="text-sm">
          <span className="font-medium">Limite de Desconto:</span> {user.discountLimit}%
        </p>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(user)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onResetPassword(user)}
          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
          title="Resetar Senha"
        >
          <Key size={18} />
        </button>
        <button
          onClick={() => onToggleActive(user)}
          className={`p-2 ${
            user.active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
          } rounded-full`}
          title={user.active ? 'Desativar' : 'Ativar'}
        >
          <Power size={18} />
        </button>
        <button
          onClick={() => onDelete(user)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
