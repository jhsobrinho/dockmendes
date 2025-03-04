import React from 'react';
import { Clock, Mail, Phone, MapPin, Calendar, Clock3 } from 'lucide-react';
import { Client } from '../../types';
import { useClientStore } from '../../store/clientStore';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit }) => {
  const { toggleClientStatus, deleteClient } = useClientStore();

  const handleToggleStatus = async () => {
    try {
      await toggleClientStatus(client.id, !client.active);
    } catch (error) {
      // Erro já está sendo tratado na store
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteClient(client.id);
      } catch (error) {
        // Erro já está sendo tratado na store
      }
    }
  };

  const daysOfWeek = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {client.name}
          </h3>
          <p className="text-sm text-gray-500">{client.document}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(client)}
            className="text-blue-600 hover:text-blue-800"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {client.email && (
          <div className="flex items-center text-gray-600">
            <Mail size={16} className="mr-2" />
            <span className="text-sm">{client.email}</span>
          </div>
        )}

        {client.phone && (
          <div className="flex items-center text-gray-600">
            <Phone size={16} className="mr-2" />
            <span className="text-sm">{client.phone}</span>
          </div>
        )}

        {client.address && (
          <div className="flex items-center text-gray-600 col-span-2">
            <MapPin size={16} className="mr-2" />
            <span className="text-sm">{client.address}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-gray-500" />
            <span className="text-sm">
              Quotas: {client.quotas} minutos
            </span>
          </div>

          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              client.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {client.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          {client.isLoyal && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Cliente Fiel
            </span>
          )}
        </div>
      </div>

      {client.autoReserve && (
        <div className="border-t pt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Reserva Automática
          </h4>
          
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span className="text-sm">
              Dias: {client.preferredDays.map(day => daysOfWeek[parseInt(day)]).join(', ')}
            </span>
          </div>

          {client.preferredTime && (
            <div className="flex items-center text-gray-600">
              <Clock3 size={16} className="mr-2" />
              <span className="text-sm">
                Horário: {client.preferredTime}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleToggleStatus}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            client.active
              ? 'text-red-700 bg-red-50 hover:bg-red-100'
              : 'text-green-700 bg-green-50 hover:bg-green-100'
          }`}
        >
          {client.active ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
