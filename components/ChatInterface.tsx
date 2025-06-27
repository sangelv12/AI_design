import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GroundingChunk } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  promptLabel: string;
  initialHelperText?: string | React.ReactNode;
  showInputArea?: boolean; // To optionally hide input for phases like Prototype results
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  promptLabel, 
  initialHelperText,
  showInputArea = true 
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const renderMessageContent = (text: string) => {
    // Basic markdown for bold and italics
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
    // Basic markdown for lists (very simplified)
    html = html.replace(/^\s*-\s+(.*)/gm, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/^\s*\*\s+(.*)/gm, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*)/gm, '<li class="ml-4 list-decimal">$1</li>');
    
    // Convert newlines to <br> tags, but be careful with list items
    if (!html.includes('<li>')) {
      html = html.replace(/\n/g, '<br />');
    } else {
      // For lists, wrap them in <ul> or <ol> if not already wrapped
      // This is a simplified heuristic
      if (html.includes('<li class="ml-4 list-disc">') && !html.startsWith('<ul>')) html = `<ul>${html}</ul>`;
      if (html.includes('<li class="ml-4 list-decimal">') && !html.startsWith('<ol>')) html = `<ol>${html}</ol>`;
    }
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
  
  const renderGroundingChunks = (chunks?: GroundingChunk[]) => {
    if (!chunks || chunks.length === 0) return null;
    const webChunks = chunks.filter(chunk => chunk.web && chunk.web.uri && chunk.web.title);
    if (webChunks.length === 0) return null;

    return (
      <div className="mt-2 p-2 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-500 mb-1">Sources:</h4>
        <ul className="list-disc list-inside space-y-1">
          {webChunks.map((chunk, index) => (
            <li key={index} className="text-xs">
              <a 
                href={chunk.web!.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#85A684] hover:underline"
              >
                {chunk.web!.title || chunk.web!.uri}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full bg-white shadow-inner rounded-lg p-1 sm:p-2 md:p-4">
      {initialHelperText && messages.length === 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
          {typeof initialHelperText === 'string' ? <p>{initialHelperText}</p> : initialHelperText}
        </div>
      )}
      <div className="flex-grow overflow-y-auto space-y-4 pr-2 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-350px)]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            } ${
              msg.sender === 'system' ? 'w-full' : ''
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-lg shadow-sm whitespace-pre-wrap break-words
                ${
                  msg.sender === 'user'
                    ? 'bg-[#85A684] text-white'
                    : msg.sender === 'ai'
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-500 italic text-sm text-center w-full shadow-none'
                }`}
            >
              {renderMessageContent(msg.text)}
              {msg.sender === 'ai' && renderGroundingChunks(msg.metadata?.groundingChunks)}
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
              <LoadingSpinner size="sm" text="AI is thinking..." />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {showInputArea && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200">
          <label htmlFor="chat-input" className="block text-sm font-medium text-gray-700 mb-1">
            {promptLabel}
          </label>
          <div className="flex space-x-2">
            <textarea
              id="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="flex-grow p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-[#85A684] focus:border-[#85A684] resize-none disabled:opacity-50"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-[#85A684] text-white rounded-md hover:bg-[#749573] focus:outline-none focus:ring-2 focus:ring-[#85A684] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatInterface;