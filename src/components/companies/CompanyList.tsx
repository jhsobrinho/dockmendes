import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Company } from '../../types/company.types';
import { useCompanyStore } from '../../store/companyStore';
import { CompanyCard } from './CompanyCard';

export const CompanyList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  const {
    companies,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchCompanies,
    deleteCompany,
    toggleCompanyActive,
    setSelectedCompany
  } = useCompanyStore();

  useEffect(() => {
    loadCompanies();
  }, [currentPage, search, showInactive]);

  const loadCompanies = () => {
    fetchCompanies({
      page: currentPage,
      limit: 10,
      search,
      active: !showInactive ? true : undefined
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleDelete = async (company: Company) => {
    if (window.confirm(`Deseja realmente excluir a empresa ${company.name}?`)) {
      await deleteCompany(company.id);
      loadCompanies();
    }
  };

  const handleToggleActive = async (company: Company) => {
    await toggleCompanyActive(company.id);
  };

  if (loading && companies.length === 0) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar empresas: {error}
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
            placeholder="Buscar empresas..."
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

      {companies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma empresa encontrada
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchCompanies({ page, search, active: !showInactive ? true : undefined })}
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
