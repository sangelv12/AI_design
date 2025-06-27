import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white p-4 mt-8 text-center text-sm text-gray-500 border-t border-gray-200">
      <p>&copy; {new Date().getFullYear()} AI Design Sprint Assistant. Powered by Gemini.</p>
    </footer>
  );
};

export default Footer;