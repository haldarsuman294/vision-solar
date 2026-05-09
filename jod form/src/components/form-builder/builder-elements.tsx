'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formElements, FormElementDef, FormInstance } from '@/lib/form-elements';
import { GripVertical, X, Edit2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// --- Sidebar Draggable Tool ---
export function DraggableSidebarElement({ 
  element, 
  onClick,
  onDoubleClick 
}: { 
  element: FormElementDef;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${element.id}`,
    data: {
      type: 'SidebarElement',
      element,
    },
  });

  const Icon = element.icon;

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      suppressHydrationWarning
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg
        cursor-grab border transition-all duration-200 select-none
        ${isDragging ? 'opacity-50 ring-2 ring-vision-green shadow-lg border-vision-green bg-green-50 text-vision-green' : 'border-transparent hover:border-light-gray hover:bg-off-white text-dark-gray hover:text-charcoal'}
      `}
    >
      <div className={`p-1.5 rounded-md select-none pointer-events-none transition-colors ${isDragging ? 'bg-vision-green text-white' : 'bg-off-white text-mid-gray group-hover:bg-white group-hover:text-vision-green'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="pointer-events-none text-xs">{element.label}</span>
    </div>
  );
}

// --- Canvas Rendered UI Preview ---
export function RenderFieldUI({ type, label, properties }: { type: string, label: string, properties?: Record<string, string> }) {
  // Simple mockups for the canvas builder preview
  switch (type) {
    case 'Heading':
      return <h2 className="text-2xl font-bold text-charcoal">{label}</h2>;
    case 'FullName':
      return (
        <div className="flex flex-col gap-2 w-full">
          {label && <label className="text-sm font-medium">{label}</label>}
          <div className="flex gap-4 w-full">
            <div className="flex-1 space-y-1"><label className="text-sm font-medium text-mid-gray">First Name</label><Input placeholder={properties?.firstNamePlaceholder || 'First'} readOnly /></div>
            <div className="flex-1 space-y-1"><label className="text-sm font-medium text-mid-gray">Last Name</label><Input placeholder={properties?.lastNamePlaceholder || 'Last'} readOnly /></div>
          </div>
        </div>
      );
    case 'Email':
      return <div className="space-y-1">{label && <label className="text-sm font-medium">{label}</label>}<Input type="email" placeholder={properties?.placeholder || "example@email.com"} readOnly /></div>;
    case 'ShortText':
    case 'Address':
    case 'Phone':
      return <div className="space-y-1">{label && <label className="text-sm font-medium">{label}</label>}<Input placeholder={properties?.placeholder || "Type here..."} readOnly /></div>;
    case 'LongText':
    case 'Paragraph':
      return <div className="space-y-1">{label && <label className="text-sm font-medium">{label}</label>}<textarea className="w-full min-h-[100px] border border-light-gray rounded-md p-3 text-sm focus:outline-none" placeholder={properties?.placeholder || "Type text here..."} readOnly /></div>;
    case 'Submit':
      return <Button className="bg-vision-green hover:bg-green-dark text-white w-full">{label}</Button>;
    case 'Divider':
      return <hr className="w-full border-light-gray" />;
    default:
      return (
        <div className="w-full h-12 bg-off-white border border-dashed border-light-gray rounded-md flex items-center justify-center text-mid-gray text-sm italic">
          Preview for {label} ({type})
        </div>
      );
  }
}

// --- Canvas Sortable Field Item ---
export function SortableFormItem({
  instance,
  onRemove,
  onUpdateInstance
}: {
  instance: FormInstance;
  onRemove: (id: string) => void;
  onUpdateInstance?: (id: string, updates: Partial<FormInstance>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const elementDef = formElements.find((el) => el.id === instance.elementId);
  const currentLabel = instance.customLabel !== undefined ? instance.customLabel : (elementDef?.label || '');
  
  const [editValue, setEditValue] = useState(currentLabel);
  const [editProperties, setEditProperties] = useState<Record<string, string>>(instance.properties || {});
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instance.id,
    data: {
      type: 'CanvasItem',
      instance,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!elementDef) return null;

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateInstance) {
      onUpdateInstance(instance.id, {
        customLabel: editValue,
        properties: editProperties
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        if (!isEditing) {
          setEditValue(currentLabel);
          setEditProperties(instance.properties || {});
          setIsEditing(true);
        }
      }}
      className={`
        relative group flex items-start gap-4 p-4 mb-4 bg-white rounded-xl
        border border-light-gray shadow-sm transition-all
        ${isDragging ? 'opacity-50 z-50 shadow-xl border-vision-green' : 'hover:border-vision-green/40'}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mt-2 text-mid-gray hover:text-charcoal cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Field Content Preview */}
      <div className="flex-1 w-full pointer-events-none group-hover:pointer-events-auto">
        {isEditing ? (
          <div className="flex flex-col gap-3 mb-4 pointer-events-auto bg-gray-50/50 p-4 rounded-lg border border-light-gray/50 relative">
            <Button size="icon" className="absolute top-3 right-3 h-8 w-8 bg-vision-green hover:bg-green-dark shadow-sm z-10" onClick={handleSave}>
              <Check className="w-4 h-4 text-white" />
            </Button>
            
            {['Heading', 'Submit'].includes(elementDef?.type || '') && (
              <div className="flex items-center gap-2 pr-10">
                <span className="text-xs font-semibold text-mid-gray w-24 shrink-0">Text</span>
                <Input 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className="max-w-[300px] h-9 text-sm bg-white"
                  autoFocus
                />
              </div>
            )}
            {elementDef?.type === 'FullName' && (
              <div className="flex flex-col gap-3 pr-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-mid-gray w-32 shrink-0">First Name Placeholder</span>
                  <Input 
                    value={editProperties.firstNamePlaceholder ?? ''} 
                    placeholder="First"
                    onChange={(e) => setEditProperties({...editProperties, firstNamePlaceholder: e.target.value})} 
                    onKeyDown={handleKeyDown}
                    className="max-w-[300px] h-9 text-sm bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-mid-gray w-32 shrink-0">Last Name Placeholder</span>
                  <Input 
                    value={editProperties.lastNamePlaceholder ?? ''} 
                    placeholder="Last"
                    onChange={(e) => setEditProperties({...editProperties, lastNamePlaceholder: e.target.value})} 
                    onKeyDown={handleKeyDown}
                    className="max-w-[300px] h-9 text-sm bg-white"
                  />
                </div>
              </div>
            )}
            
            {['Email', 'ShortText', 'Address', 'Phone', 'LongText', 'Paragraph'].includes(elementDef?.type || '') && (
              <div className="flex items-center gap-2 pr-10">
                <span className="text-xs font-semibold text-mid-gray w-24 shrink-0">Placeholder</span>
                <Input 
                  value={editProperties.placeholder ?? ''} 
                  placeholder="Enter placeholder..."
                  onChange={(e) => setEditProperties({...editProperties, placeholder: e.target.value})} 
                  onKeyDown={handleKeyDown}
                  className="max-w-[300px] h-9 text-sm bg-white"
                />
              </div>
            )}
          </div>
        ) : null}
        {!isEditing && (
          <div className="pointer-events-none">
             <RenderFieldUI type={elementDef.type} label={currentLabel} properties={instance.properties} />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-mid-gray hover:text-vision-green hover:bg-green-50 rounded-full"
          onClick={() => {
            setEditValue(currentLabel);
            setEditProperties(instance.properties || {});
            setIsEditing(true);
          }}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-mid-gray hover:text-red-500 hover:bg-red-50 rounded-full"
          onClick={() => onRemove(instance.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
