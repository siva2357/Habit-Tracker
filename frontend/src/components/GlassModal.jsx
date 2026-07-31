import React from 'react';
import { X } from 'lucide-react';

const GlassModal = ({ isOpen, onClose, title, children, onSave, saveText = "Save", error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg glass-panel p-6 z-10 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold m-0">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto mb-6 no-scrollbar">
          {children}
        </div>
        
        <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-white/10">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="btn-primary"
          >
            {saveText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassModal;
