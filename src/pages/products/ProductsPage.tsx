import React, { useState, useEffect } from 'react';
import { Product, Company } from '../../types';
import { useProductStore } from '../../store/productStore';
import { useCompanyStore } from '../../store/companyStore';
import ProductList from '../../components/products/ProductList';
import ProductForm from '../../components/products/ProductForm';
import Modal from '../../components/shared/Modal';
import { useAuthStore } from '../../store/authStore';

export const ProductsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuthStore();
  
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    error: productError,
    clearError
  } = useProductStore();

  const {
    companies,
    fetchCompanies,
    error: companyError
  } = useCompanyStore();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCompanies();
    }
  }, [user]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(product.id);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data);
      } else {
        await createProduct(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Produtos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie os produtos da sua empresa
        </p>
      </div>

      {(productError || companyError) && (
        <div className="mb-4 bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{productError || companyError}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Fechar
          </button>
        </div>
      )}

      <ProductList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Editar Produto' : 'Novo Produto'}
      >
        <ProductForm
          product={selectedProduct}
          companies={companies}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ProductsPage;
