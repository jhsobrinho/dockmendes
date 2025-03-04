import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import DockKanban from '../components/docks/DockKanban';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import { Dock } from '../types';

const DockManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mock data for demonstration
  const docks: Dock[] = [
    {
      id: '1',
      name: 'Dock A',
      companyId: '1',
      workingHours: { start: '08:00', end: '17:00' },
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Dock B',
      companyId: '1',
      workingHours: { start: '08:00', end: '17:00' },
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Dock C',
      companyId: '1',
      workingHours: { start: '08:00', end: '17:00' },
      isBlocked: true,
      blockReason: 'Maintenance',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Dock D',
      companyId: '1',
      workingHours: { start: '08:00', end: '17:00' },
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  const scheduleItems = {
    '1': [
      {
        id: '1',
        orderId: '101',
        clientName: 'ABC Company',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        status: 'in_progress' as const,
      },
      {
        id: '2',
        orderId: '102',
        clientName: 'XYZ Corp',
        startTime: '11:00',
        endTime: '12:00',
        duration: 60,
        status: 'scheduled' as const,
      },
    ],
    '2': [
      {
        id: '3',
        orderId: '103',
        clientName: 'Global Industries',
        startTime: '09:30',
        endTime: '11:00',
        duration: 90,
        status: 'completed' as const,
      },
    ],
    '4': [
      {
        id: '4',
        orderId: '104',
        clientName: 'Local Distributors',
        startTime: '13:00',
        endTime: '14:30',
        duration: 90,
        status: 'scheduled' as const,
      },
      {
        id: '5',
        orderId: '105',
        clientName: 'City Logistics',
        startTime: '15:00',
        endTime: '16:00',
        duration: 60,
        status: 'scheduled' as const,
      },
    ],
  };
  
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(selectedDate);

  return (
    <Layout title="Dock Management">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <button 
            onClick={handlePreviousDay}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="mx-2 flex items-center">
            <Calendar size={20} className="mr-2 text-blue-600" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <button 
            onClick={handleNextDay}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
          >
            Filter
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
          >
            New Schedule
          </Button>
        </div>
      </div>
      
      <DockKanban 
        docks={docks}
        scheduleItems={scheduleItems}
        selectedDate={selectedDate}
      />
    </Layout>
  );
};

export default DockManagement;