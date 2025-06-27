import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white p-4 shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto flex items-center">
        <span className="text-2xl font-bold text-[#85A684]"> UX/UI Design Assistant</span>
      </div>
    </header>
  );
};

export default Header;