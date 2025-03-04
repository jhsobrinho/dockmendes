import React from 'react';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Company } from '../../types/company.types';

interface CompanyCardProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onToggleActive?: (company: Company) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${!company.active ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <Building2 className="w-6 h-6 text-primary mr-2" />
          <h3 className="text-lg font-semibold">{company.name}</h3>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(company)}
              className="text-blue-600 hover:text-blue-800"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(company)}
              className="text-red-600 hover:text-red-800"
            >
              Excluir
            </button>
          )}
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(company)}
              className={`${
                company.active ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {company.active ? 'Ativo' : 'Inativo'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-gray-600">
        <p className="flex items-center">
          <span className="font-medium mr-2">CNPJ/CPF:</span>
          {company.document}
        </p>
        
        {company.address && (
          <p className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {company.address}
          </p>
        )}
        
        {company.phone && (
          <p className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            {company.phone}
          </p>
        )}
        
        {company.email && (
          <p className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            {company.email}
          </p>
        )}
      </div>
    </div>
  );
};
