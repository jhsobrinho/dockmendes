import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { CompanyList } from '../../components/companies/CompanyList';
import { CompanyForm } from '../../components/companies/CompanyForm';
import { useCompanyStore } from '../../store/companyStore';
import { CompanyCreate, CompanyUpdate } from '../../types/company.types';

export const CompaniesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { selectedCompany, createCompany, updateCompany, setSelectedCompany } = useCompanyStore();

  const handleSubmit = async (data: CompanyCreate | CompanyUpdate) => {
    console.log('CompaniesPage recebeu dados para salvar:', data);
    try {
      if (selectedCompany) {
        console.log('Atualizando empresa existente:', selectedCompany.id);
        await updateCompany(selectedCompany.id, data);
      } else {
        console.log('Criando nova empresa');
        await createCompany(data as CompanyCreate);
      }
      console.log('Operação concluída com sucesso');
      handleCloseForm();
    } catch (error) {
      console.error('Erro detalhado ao salvar empresa:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
  };

  const handleNewCompany = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  return (
    <Layout title="Empresas">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <button
            onClick={handleNewCompany}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Empresa
          </button>
        </div>

        {isFormOpen || selectedCompany ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">
                {selectedCompany ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <CompanyForm
                company={selectedCompany}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        ) : (
          <CompanyList />
        )}
      </div>
    </Layout>
  );
};
