import React from 'react';
import { SprintPhase, PhaseConfig } from '../types';

interface PhaseSelectorProps {
  phases: Record<SprintPhase, PhaseConfig>;
  currentPhase: SprintPhase;
  onSelectPhase: (phase: SprintPhase) => void;
}

const PhaseSelector: React.FC<PhaseSelectorProps> = ({ phases, currentPhase, onSelectPhase }) => {
  return (
    <nav className="bg-white p-3 shadow-md mb-6 sticky top-[72px] z-40 overflow-x-auto whitespace-nowrap border-b border-gray-200">
      <div className="container mx-auto flex space-x-2 justify-center">
        {Object.values(phases).map((phase) => (
          <button
            key={phase.id}
            onClick={() => onSelectPhase(phase.id)}
            className={`flex-shrink-0 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#85A684] focus:ring-opacity-50
              ${currentPhase === phase.id 
                ? 'bg-[#85A684] text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center space-x-2">
              {phase.icon}
              <span>{phase.title}</span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default PhaseSelector;