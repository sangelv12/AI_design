import React, { useState, useCallback } from 'react';

interface SummaryDisplayProps {
  summary: string;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.042m-7.416 0v3.042c0 .212.03.418.084.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }, [summary]);

  return (
    <div className="mt-4 relative">
      <label htmlFor="summary-output" className="sr-only">Phase Summary</label>
      <textarea
        id="summary-output"
        readOnly
        value={summary}
        className="w-full h-40 p-3 pr-28 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-[#85A684] focus:border-transparent"
        aria-label="Phase summary"
      />
      <div className="absolute top-3 right-3">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#85A684] flex items-center space-x-2 transition-all duration-150"
            aria-live="polite"
          >
            {copyStatus === 'idle' ? 
                <CopyIcon className="w-5 h-5 text-gray-500" /> : 
                <CheckIcon className="w-5 h-5 text-green-600" />
            }
            <span className={copyStatus === 'copied' ? 'text-green-700' : 'text-gray-700'}>
              {copyStatus === 'idle' ? 'Copy' : 'Copied!'}
            </span>
          </button>
      </div>
    </div>
  );
};

export default SummaryDisplay;
