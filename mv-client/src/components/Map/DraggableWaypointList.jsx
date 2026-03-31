import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, MapPin, Navigation } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';

/**
 * UI COMPONENT: DRAGGABLE WAYPOINT LIST
 * An isolated floating list that strictly handles @hello-pangea/dnd logic.
 * Reads global dropoffs and safely mutates the array sequence in Zustand.
 */
export default function DraggableWaypointList() {
  const { pickup, dropoffs, setOptimizedDropoffs } = useBookingStore();

  const handleDragEnd = (result) => {
    // Dropped outside the list bounds
    if (!result.destination) return;

    // Clone the array to prevent direct state mutation errors
    const reorderedDropoffs = Array.from(dropoffs);
    
    // Remove from old index and insert into new index
    const [movedItem] = reorderedDropoffs.splice(result.source.index, 1);
    reorderedDropoffs.splice(result.destination.index, 0, movedItem);

    // Commit strictly to Zustand store via the optimization action
    setOptimizedDropoffs(reorderedDropoffs);
  };

  // Only render if we actually have stops to show
  if (!pickup?.lat && dropoffs.length === 0) return null;

  return (
    <div className="absolute top-6 left-6 z-[1500] w-full max-w-[280px] bg-white/90 backdrop-blur-md p-4 rounded-[24px] shadow-2xl border border-gray-100 font-sans">
      
      {/* Fixed Pickup Node (Cannot be dragged) */}
      {pickup?.lat && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3 border-l-4 border-black">
          <Navigation size={18} className="text-black shrink-0 rotate-45" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Pickup</span>
            <p className="text-[13px] font-bold text-black truncate">{pickup.address || 'Selected Location'}</p>
          </div>
        </div>
      )}

      {/* Draggable Dropoff Nodes */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dropoffs-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-2"
            >
              {dropoffs.map((drop, index) => {
                if (!drop?.lat) return null; // Hide empty, unselected inputs

                return (
                  <Draggable key={`dropoff-${index}-${drop.lat}`} draggableId={`dropoff-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${snapshot.isDragging ? 'bg-blue-50 shadow-xl scale-105 border-blue-200' : 'bg-white border border-gray-100 shadow-sm'}`}
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="text-gray-300 hover:text-black cursor-grab active:cursor-grabbing px-1">
                          <GripVertical size={18} />
                        </div>
                        
                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                          {index + 1}
                        </div>
                        
                        <div className="overflow-hidden flex-1">
                          <p className="text-[13px] font-bold text-black truncate leading-snug">
                            {drop.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
    </div>
  );
}