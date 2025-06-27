import React from 'react';
import { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow hover:shadow-xl transition-shadow duration-150">
      <p className="text-gray-800">{idea.text}</p>
      {idea.category && (
        <span className="mt-2 inline-block bg-[#85A684] text-xs text-white px-2 py-1 rounded-full">
          {idea.category}
        </span>
      )}
    </div>
  );
};

export default IdeaCard;