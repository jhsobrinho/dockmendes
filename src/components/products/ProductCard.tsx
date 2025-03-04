import React from 'react';
import { Product } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${!product.active ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          {product.company && (
            <p className="text-sm text-gray-500">{product.company.name}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Editar produto"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Excluir produto"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {product.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500">Preço</p>
          <p className="font-semibold text-gray-800">{formatCurrency(product.price)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Estoque</p>
          <p className="font-semibold text-gray-800">{product.stock} unidades</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tempo de Carga</p>
          <p className="font-semibold text-gray-800">{product.loadingTime} minutos</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              product.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {product.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
