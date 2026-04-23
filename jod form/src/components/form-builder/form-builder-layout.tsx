'use client';

import React, { useState } from 'react';
import { ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { ElementsSidebar } from './elements-sidebar';
import { FormCanvas } from './form-canvas';
import { FormInstance, formElements } from '@/lib/form-elements';
import { DraggableSidebarElement, SortableFormItem, RenderFieldUI } from './builder-elements';
import { FormSettingsView } from './form-settings-view';
import { FormPublishView } from './form-publish-view';

export function FormBuilderLayout() {
  const [activeTab, setActiveTab] = useState<'BUILD' | 'SETTINGS' | 'PUBLISH'>('BUILD');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop');
  const [instances, setInstances] = useState<FormInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'sidebar' | 'canvas' | null>(null);

  const handleAddElementClick = (element: FormElementDef) => {
    const newInstance: FormInstance = {
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      elementId: element.id,
    };
    setInstances((prev) => [...prev, newInstance]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    if (active.data.current?.type === 'SidebarElement') {
      setActiveType('sidebar');
    } else {
      setActiveType('canvas');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    // Handled drops originating from sidebar
    if (active.data.current?.type === 'SidebarElement') {
      const element = active.data.current.element;
      
      const newInstance: FormInstance = {
        id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        elementId: element.id,
      };

      // Dropping anywhere inside form-canvas creates it at the end, 
      // or if dropping over an existing SortableFormItem, we put it there
      if (over.id === 'form-canvas') {
        setInstances([...instances, newInstance]);
      } else {
        const overIndex = instances.findIndex((i) => i.id === over.id);
        const newIndex = overIndex >= 0 ? overIndex : instances.length;
        const newInstances = [...instances];
        newInstances.splice(newIndex, 0, newInstance);
        setInstances(newInstances);
      }
      return;
    }

    // Handle re-ordering
    if (active.id !== over.id && active.data.current?.type === 'CanvasItem') {
      setInstances((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemove = (id: string) => {
    setInstances((items) => items.filter((i) => i.id !== id));
  };

  const handleUpdateInstance = (id: string, updates: Partial<FormInstance>) => {
    setInstances((items) =>
      items.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const getActiveElement = () => {
    if (!activeId) return null;
    
    if (activeType === 'sidebar') {
      // Find element in library
      const pureId = activeId.replace('sidebar-', '');
      const def = formElements.find(el => el.id === pureId);
      if (def) return <DraggableSidebarElement element={def} />;
    }
    
    if (activeType === 'canvas') {
      const inst = instances.find(i => i.id === activeId);
      if (inst) return <SortableFormItem instance={inst} onRemove={() => {}} onUpdateInstance={() => {}} />;
    }
    
    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="-mt-6 -mx-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-off-white transition-colors duration-300">
        
        {/* Form Builder Header */}
        {!isPreviewMode ? (
          <div className="bg-white shrink-0 z-30 shadow-sm relative border-b border-light-gray/50 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Top Row: Title */}
            <div className="flex items-center justify-center py-3 relative">
              <div className="text-center">
                <h1 className="text-xl font-bold text-charcoal leading-tight">Form</h1>
                <p className="text-[11px] text-vision-green font-semibold flex items-center justify-center gap-1 mt-0.5">
                  All changes saved at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </p>
              </div>
            </div>

            {/* Bottom Row: Tabs */}
            <div className="bg-vision-green flex items-end justify-center px-6 relative h-[48px]">
              <div className="flex h-full items-end">
                <button 
                  onClick={() => setActiveTab('BUILD')}
                  className={`px-8 py-2.5 text-xs font-bold tracking-wider rounded-t-md h-[40px] flex items-center justify-center transition-colors ${
                    activeTab === 'BUILD' ? 'text-vision-green bg-off-white border-b-0' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  BUILD
                </button>
                <button 
                  onClick={() => setActiveTab('SETTINGS')}
                  className={`px-8 py-2.5 text-xs font-bold tracking-wider rounded-t-md h-[40px] flex items-center justify-center transition-colors ${
                    activeTab === 'SETTINGS' ? 'text-vision-green bg-off-white border-b-0' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  SETTINGS
                </button>
                <button 
                  onClick={() => setActiveTab('PUBLISH')}
                  className={`px-8 py-2.5 text-xs font-bold tracking-wider rounded-t-md h-[40px] flex items-center justify-center transition-colors ${
                    activeTab === 'PUBLISH' ? 'text-vision-green bg-off-white border-b-0' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  PUBLISH
                </button>
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <span className="text-xs font-bold tracking-wider text-white">Preview Form</span>
                <button 
                  onClick={() => setIsPreviewMode(true)}
                  className="w-10 h-5.5 bg-white/30 hover:bg-white/40 rounded-full relative transition-colors focus:outline-none flex items-center px-0.5 cursor-pointer border border-white/20"
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-sm absolute left-0.5 transition-all"></span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode Header */
          <div className="bg-charcoal shrink-0 z-30 shadow-sm flex items-center justify-between px-6 h-14 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Left: Link & Fill Form */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/10 rounded-md overflow-hidden h-8 w-72 border border-white/10 transition-colors hover:bg-white/15 focus-within:bg-white focus-within:border-vision-green group">
                <input 
                  readOnly 
                  value="https://form.visionsolar.com/preview" 
                  className="flex-1 px-3 text-xs text-white group-focus-within:text-charcoal bg-transparent outline-none truncate"
                />
                <button className="h-full px-2.5 text-white/50 hover:text-white group-focus-within:text-mid-gray group-focus-within:hover:text-charcoal transition-colors flex items-center justify-center border-l border-white/10 group-focus-within:border-light-gray/50">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
              <button className="h-8 px-4 bg-vision-green hover:bg-green-dark text-white text-xs font-bold tracking-wider rounded-md transition-colors flex items-center shadow-sm">
                Fill Form
              </button>
            </div>

            {/* Right: Devices & Toggle */}
            <div className="flex items-center h-full">
              <div className="flex items-center h-full mr-6">
                <button 
                  onClick={() => setPreviewDevice('phone')}
                  className={`flex flex-col items-center justify-center h-full px-4 border-b-4 transition-colors ${previewDevice === 'phone' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  <Smartphone className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Phone</span>
                </button>
                <button 
                  onClick={() => setPreviewDevice('tablet')}
                  className={`flex flex-col items-center justify-center h-full px-4 border-b-4 transition-colors ${previewDevice === 'tablet' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  <Tablet className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Tablet</span>
                </button>
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex flex-col items-center justify-center h-full px-4 border-b-4 transition-colors ${previewDevice === 'desktop' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  <Monitor className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Desktop</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-wider text-white">Preview Form</span>
                <button 
                  onClick={() => setIsPreviewMode(false)}
                  className="w-10 h-5.5 bg-vision-green rounded-full relative transition-colors focus:outline-none flex items-center px-0.5 cursor-pointer shadow-inner border border-vision-green/50"
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-sm absolute right-0.5 transition-all"></span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Builder Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {isPreviewMode ? (
            <div className="flex-1 overflow-y-auto w-full bg-[#f3f3f5] flex justify-center py-12 px-4 transition-all duration-300 animate-in fade-in zoom-in-95">
              <div 
                className={`bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)] transition-all duration-500 ease-in-out ${
                  previewDevice === 'phone' ? 'w-[375px] rounded-3xl min-h-[812px] border-[8px] border-charcoal/10' :
                  previewDevice === 'tablet' ? 'w-[768px] rounded-2xl min-h-[1024px] border-[12px] border-charcoal/10' :
                  'w-[800px] min-h-[800px] rounded-md border border-light-gray'
                }`}
              >
                {/* Form Header (Preview) */}
                <div className="px-10 pt-12 pb-6 border-b border-light-gray/40">
                  <h1 className="text-3xl font-bold text-charcoal">Form</h1>
                </div>

                {/* Form Elements (Preview) */}
                <div className="p-10 flex flex-col gap-6">
                  {instances.length === 0 ? (
                    <div className="text-center text-mid-gray italic py-10">Empty form</div>
                  ) : (
                    instances.map((instance) => {
                      const elementDef = formElements.find((el) => el.id === instance.elementId);
                      if (!elementDef) return null;
                      const currentLabel = instance.customLabel !== undefined ? instance.customLabel : (elementDef.label || '');
                      return (
                        <div key={instance.id} className="w-full">
                          <RenderFieldUI type={elementDef.type} label={currentLabel} properties={instance.properties} />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'BUILD' ? (
            <>
              <div className="z-20 h-full flex-shrink-0">
                <ElementsSidebar onAddElement={handleAddElementClick} />
              </div>
              <div className="flex-1 overflow-y-auto w-full relative">
                <FormCanvas instances={instances} onRemove={handleRemove} onUpdateInstance={handleUpdateInstance} />
              </div>
            </>
          ) : activeTab === 'SETTINGS' ? (
            <FormSettingsView />
          ) : (
            <FormPublishView />
          )}
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}
      >
        {getActiveElement()}
      </DragOverlay>
    </DndContext>
  );
}
