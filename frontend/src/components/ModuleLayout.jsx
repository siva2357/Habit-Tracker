import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

const ModuleLayout = ({ title, leftPanel, children, onAdd, addText }) => {
  return (
    <div className="page-container flex flex-col min-h-[calc(100vh-4rem)] flex-1 py-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/home" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold m-0">{title}</h1>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            {addText || "Add"}
          </button>
        )}
      </header>

      {/* Main Layout Area */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel */}
        {leftPanel && (
          <div className="w-64 shrink-0 glass-panel p-4 flex flex-col overflow-y-auto hidden md:flex custom-scrollbar">
            {leftPanel}
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto relative flex flex-col custom-scrollbar pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModuleLayout;
