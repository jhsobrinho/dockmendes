import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Client } from '../../types';
import { useClientStore } from '../../store/clientStore';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  isLoyal: z.boolean().default(false),
  quotas: z.number().min(0, 'Quotas não pode ser negativo').default(0),
  autoReserve: z.boolean().default(false),
  preferredDays: z.array(z.string()).default([]),
  preferredTime: z.string().optional(),
  active: z.boolean().default(true),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onClose: () => void;
  initialData?: Client;
}

const ClientForm: React.FC<ClientFormProps> = ({ onClose, initialData }) => {
  const { createClient, updateClient, error, clearError } = useClientStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      isLoyal: false,
      quotas: 0,
      autoReserve: false,
      preferredDays: [],
      active: true,
    },
  });

  const autoReserve = watch('autoReserve');

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (initialData) {
        await updateClient(initialData.id, data);
      } else {
        await createClient(data);
      }
      onClose();
    } catch (error) {
      // Erro já está sendo tratado na store
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-sm underline"
          >
            Limpar
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Documento
        </label>
        <input
          type="text"
          {...register('document')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.document && (
          <p className="mt-1 text-sm text-red-500">{errors.document.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Endereço
        </label>
        <input
          type="text"
          {...register('address')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input
          type="text"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isLoyal')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Cliente Fiel
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('active')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Ativo
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Quotas (minutos)
        </label>
        <input
          type="number"
          {...register('quotas', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.quotas && (
          <p className="mt-1 text-sm text-red-500">{errors.quotas.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('autoReserve')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Reserva Automática
          </label>
        </div>

        {autoReserve && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dias Preferidos
              </label>
              <div className="mt-1 space-y-2">
                {daysOfWeek.map((day, index) => (
                  <div key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      value={index.toString()}
                      {...register('preferredDays')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Horário Preferido
              </label>
              <input
                type="time"
                {...register('preferredTime')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
