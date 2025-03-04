import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Truck, Calendar, Clock, Package } from 'lucide-react';
import { Order, Dock } from '../../types';

// This is a simplified version - in a real app, you'd use a proper drag-and-drop library
// like react-beautiful-dnd, but for this example we'll create a visual representation

interface DockScheduleItem {
  id: string;
  orderId: string;
  clientName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface DockColumnProps {
  dock: Dock;
  scheduleItems: DockScheduleItem[];
  date: Date;
}

const DockColumn: React.FC<DockColumnProps> = ({ dock, scheduleItems, date }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);

  return (
    <div className="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">{dock.name}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar size={14} className="mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${dock.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {dock.isBlocked ? 'Blocked' : 'Available'}
        </div>
      </div>

      <div className="space-y-3">
        {scheduleItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Truck size={24} className="mx-auto mb-2" />
            <p>No scheduled trucks</p>
          </div>
        ) : (
          scheduleItems.map((item) => (
            <div 
              key={item.id}
              className={`bg-white p-3 rounded-md shadow-sm border-l-4 ${
                item.status === 'in_progress' 
                  ? 'border-blue-500' 
                  : item.status === 'completed'
                  ? 'border-green-500'
                  : item.status === 'cancelled'
                  ? 'border-red-500'
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-800">{item.clientName}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === 'in_progress' 
                    ? 'bg-blue-100 text-blue-800' 
                    : item.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>{item.startTime} - {item.endTime}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Package size={14} className="mr-1" />
                  <span>{item.duration} min</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface DockKanbanProps {
  docks: Dock[];
  scheduleItems: Record<string, DockScheduleItem[]>;
  selectedDate: Date;
}

const DockKanban: React.FC<DockKanbanProps> = ({ 
  docks, 
  scheduleItems,
  selectedDate
}) => {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex space-x-4 min-w-max">
        {docks.map((dock) => (
          <DockColumn 
            key={dock.id}
            dock={dock}
            scheduleItems={scheduleItems[dock.id] || []}
            date={selectedDate}
          />
        ))}
      </div>
    </div>
  );
};

export default DockKanban;