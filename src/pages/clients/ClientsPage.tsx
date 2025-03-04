import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ClientList from '../../components/clients/ClientList';
import ClientForm from '../../components/clients/ClientForm';
import { Client } from '../../types';
import Modal from '../../components/shared/Modal';

const ClientsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Clientes
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus size={20} className="mr-2" />
          Novo Cliente
        </button>
      </div>

      <ClientList onEditClient={handleEditClient} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <ClientForm
          onClose={handleCloseModal}
          initialData={selectedClient}
        />
      </Modal>
    </div>
  );
};

export default ClientsPage;
