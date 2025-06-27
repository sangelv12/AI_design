import React, { useState, useEffect, useCallback } from 'react';
import { Chat, Part } from '@google/genai';
import { SprintPhase, PhaseConfig, ChatMessage, Idea, GroundingChunk } from './types';
import { PHASE_CONFIGS, DEFAULT_PERSONA } from './constants';
import * as geminiService from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import PhaseSelector from './components/PhaseSelector';
import ChatInterface from './components/ChatInterface';
import IdeaCard from './components/IdeaCard';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryDisplay from './components/SummaryDisplay';
import ImageUploader from './components/ImageUploader';

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
};


const App: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<SprintPhase>(SprintPhase.Understand);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  const [personaInput, setPersonaInput] = useState<string>(DEFAULT_PERSONA);
  const [problemStatementInput, setProblemStatementInput] = useState<string>('');
  
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [generatedPrototypeSpec, setGeneratedPrototypeSpec] = useState<string | null>(null);
  const [prototypeImages, setPrototypeImages] = useState<File[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const currentPhaseConfig = PHASE_CONFIGS[currentPhase];

  useEffect(() => {
    const checkApiKey = async () => {
      if (process.env.API_KEY && process.env.API_KEY !== "YOUR_API_KEY_HERE") {
         const initialized = geminiService.initializeGemini();
         setApiKeyStatus(initialized ? 'ok' : 'error');
         if (!initialized) setErrorMessage("Failed to initialize Gemini service. API Key might be invalid or missing.");
      } else {
        setApiKeyStatus('error');
        setErrorMessage("API_KEY environment variable is not set. Please configure it to use the AI features.");
      }
    };
    checkApiKey();
  }, []);

  const resetPhaseState = useCallback(() => {
    setChatMessages([]);
    setGeneratedIdeas([]);
    setGeneratedPrototypeSpec(null);
    setPrototypeImages([]);
    setErrorMessage(null);
    setCurrentSummary(null);
    geminiService.resetChat(); // Resets chat instance in service
  }, []);

  useEffect(() => {
    resetPhaseState();
    // Initialize chat for phases that need it with specific system instructions
    const initChatForPhase = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const config = PHASE_CONFIGS[currentPhase];
        let systemInstruction: string | undefined;

        if (config.aiSystemInstruction) {
          let p1: string | undefined = undefined;
          let p2: string | undefined = undefined;

          if (currentPhase === SprintPhase.Understand || currentPhase === SprintPhase.Test) {
            p1 = personaInput;
          } else if (currentPhase === SprintPhase.Sketch) {
             p1 = problemStatementInput || "a user-defined problem";
          } else if (currentPhase === SprintPhase.Decide) {
            const ideasText = generatedIdeas.length > 0 ? generatedIdeas.map(idea => idea.text).join('\n') : "no ideas provided yet";
            p1 = ideasText;
          }
          systemInstruction = config.aiSystemInstruction(p1, p2);
        }
        
        // Start a chat for all phases that use it, except those that make single-shot calls
        if (systemInstruction && currentPhase !== SprintPhase.Sketch) {
           await geminiService.startNewChat(systemInstruction);
        }
      } catch (error: any) {
        console.error("Error initializing chat for phase:", error);
        setErrorMessage(error.message || "Failed to initialize AI for this phase.");
      } finally {
        setIsLoading(false);
      }
    };

    if (apiKeyStatus === 'ok') {
       initChatForPhase();
    }
  }, [currentPhase, apiKeyStatus, personaInput, problemStatementInput, resetPhaseState]);

  const handleSelectPhase = (phase: SprintPhase) => {
    setCurrentPhase(phase);
  };
  
  const handlePrototypeImagesChange = (files: File[]) => {
    setPrototypeImages(files);
     if (files.length > 0 && chatMessages.length === 0) {
        addMessageToChat('system', `${files.length} image(s) loaded for testing. The AI will now analyze them. Ask a question to begin.`);
    } else if (files.length === 0) {
        setChatMessages(prev => prev.filter(m => !m.text.includes('image(s) loaded for testing')));
    }
  };

  const addMessageToChat = (sender: 'user' | 'ai' | 'system', text: string, metadata?: ChatMessage['metadata']) => {
    setChatMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender, text, timestamp: new Date(), metadata }]);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || apiKeyStatus !== 'ok') return;

    addMessageToChat('user', message);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let aiResponseText = '';
      let responseGroundingChunks: GroundingChunk[] | undefined = undefined;
      const chatInstance = geminiService.getCurrentChatInstance();

      // Ensure chat is initialized if it wasn't already
      if (!chatInstance) {
          let systemInstructionText = currentPhaseConfig.aiSystemInstruction ? currentPhaseConfig.aiSystemInstruction() : "You are a helpful assistant.";
          const chatHistory = chatMessages
                .filter(cm => cm.sender === 'user' || cm.sender === 'ai')
                .map(cm => ({ role: cm.sender === 'user' ? 'user' : 'model', parts: [{ text: cm.text }] }));
          await geminiService.startNewChat(systemInstructionText, chatHistory);
      }
      
      const refreshedChatInstance = geminiService.getCurrentChatInstance()!;

      if (currentPhase === SprintPhase.Sketch) {
        const problemForIdeation = generatedIdeas.length === 0 ? problemStatementInput || message : message;
        const systemInstruction = currentPhaseConfig.aiSystemInstruction!(problemForIdeation);
        const response = await geminiService.generateText(message, systemInstruction);
        aiResponseText = response.text;
        
        const jsonData = geminiService.extractJsonFromString(aiResponseText);
        let ideas: string[] = [];
        if (jsonData && Array.isArray(jsonData.ideas)) {
            ideas = jsonData.ideas.filter((idea: any) => typeof idea === 'string');
        } else {
            ideas = geminiService.extractMarkdownListItems(aiResponseText);
        }
        if (ideas.length > 0) {
            const newIdeasList = ideas.map(txt => ({ id: Date.now().toString() + Math.random(), text: txt }));
            setGeneratedIdeas(prev => [...prev, ...newIdeasList]);
            addMessageToChat('system', `${newIdeasList.length} new ideas generated and added below.`);
        }
      } else if (currentPhase === SprintPhase.Test) {
          const textPart = { text: message };
          const imageParts = await Promise.all(prototypeImages.map(fileToGenerativePart));
          const fullMessage = [...imageParts, textPart];
          
          const response = await geminiService.sendMessageToChat(refreshedChatInstance, fullMessage);
          aiResponseText = response.text;
          setPrototypeImages([]); // Clear images after sending
      } else if (currentPhase === SprintPhase.Prototype) {
          const response = await geminiService.sendMessageToChat(refreshedChatInstance, message);
          aiResponseText = response.text;
          setGeneratedPrototypeSpec(aiResponseText);
      }
      else { // Standard chat phases
          const response = await geminiService.sendMessageToChat(refreshedChatInstance, message);
          aiResponseText = response.text;
          responseGroundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[];
      }
      addMessageToChat('ai', aiResponseText, { groundingChunks: responseGroundingChunks });

    } catch (error: any) {
      console.error("Error with Gemini API:", error);
      const errText = error.message || "An error occurred while communicating with the AI.";
      addMessageToChat('system', `Error: ${errText}`);
      setErrorMessage(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (apiKeyStatus !== 'ok' || isSummarizing) return;

    setIsSummarizing(true);
    setCurrentSummary(null);
    setErrorMessage(null);

    let contentToSummarize = `User Persona: ${personaInput}\n\n`;
    if (currentPhase === SprintPhase.Sketch || currentPhase === SprintPhase.Define) {
        if(problemStatementInput) contentToSummarize += `Problem Statement: ${problemStatementInput}\n\n`;
    }

    if (chatMessages.length > 0) {
        contentToSummarize += "Conversation History:\n" + chatMessages
            .map(msg => `[${msg.sender}]: ${msg.text}`)
            .join('\n');
    }

    if (currentPhase === SprintPhase.Sketch && generatedIdeas.length > 0) {
        contentToSummarize += "\n\nGenerated Ideas:\n" + generatedIdeas.map(idea => `- ${idea.text}`).join('\n');
    }

    if (currentPhase === SprintPhase.Prototype && generatedPrototypeSpec) {
      contentToSummarize += `\n\nGenerated Prototype Spec:\n ${generatedPrototypeSpec}`;
    }

    if (contentToSummarize.trim().length < 50) {
        setErrorMessage("Not enough content to generate a meaningful summary.");
        setIsSummarizing(false);
        return;
    }

    try {
        const summaryText = await geminiService.generateSummary(contentToSummarize, currentPhase);
        setCurrentSummary(summaryText);
    } catch (error: any) {
        const errText = error.message || "An error occurred while generating the summary.";
        setErrorMessage(errText);
    } finally {
        setIsSummarizing(false);
    }
  };
  
  const renderPhaseSpecificInputs = () => {
    if (isLoading && chatMessages.length === 0) return null;

    const hasInputs = currentPhaseConfig.requiresPersonaInput || currentPhaseConfig.requiresProblemStatementInput;
    if (!hasInputs) return null;

    return (
      <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
        {currentPhaseConfig.requiresPersonaInput && (
          <div>
            <label htmlFor="personaInput" className="block text-sm font-medium text-gray-700 mb-1">User Persona Definition:</label>
            <textarea
              id="personaInput"
              value={personaInput}
              onChange={(e) => setPersonaInput(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-[#85A684] focus:border-[#85A684]"
              placeholder="e.g., A busy parent who needs quick and easy meal solutions."
            />
          </div>
        )}
        {currentPhaseConfig.requiresProblemStatementInput && (
           <div>
            <label htmlFor="problemStatementInput" className="block text-sm font-medium text-gray-700 mb-1">Problem Statement (for Ideation):</label>
            <textarea
              id="problemStatementInput"
              value={problemStatementInput}
              onChange={(e) => setProblemStatementInput(e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-[#85A684] focus:border-[#85A684]"
              placeholder="e.g., Users find it hard to discover new local events."
            />
          </div>
        )}
      </div>
    );
  }

  const renderContent = () => {
    if (apiKeyStatus === 'checking') {
      return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Initializing AI Service..." /></div>;
    }
    if (apiKeyStatus === 'error') {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
          <h3 className="text-lg font-semibold mb-2">Service Unavailable</h3>
          <p>{errorMessage || "API Key not configured or invalid. Please check console for details."}</p>
        </div>
      );
    }

    return (
      <>
        {renderPhaseSpecificInputs()}
        {errorMessage && !chatMessages.find(cm => cm.text.includes(errorMessage!)) && (
            <div className="my-2 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-400">
                Global Error: {errorMessage}
            </div>
        )}
        
        {currentPhase !== SprintPhase.Sketch && currentPhase !== SprintPhase.Prototype && currentPhase !== SprintPhase.Test && (
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            promptLabel={currentPhaseConfig.userPromptLabel}
            initialHelperText={currentPhaseConfig.initialHelperText}
          />
        )}
        
        {currentPhase === SprintPhase.Sketch && (
          <div>
              {generatedIdeas.length === 0 && (
                  <ChatInterface
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      promptLabel={currentPhaseConfig.userPromptLabel}
                      initialHelperText={currentPhaseConfig.initialHelperText}
                  />
              )}
              {generatedIdeas.length > 0 && (
                  <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-3 text-[#85A684]">Generated Ideas:</h3>
                      {isLoading && chatMessages[chatMessages.length-1]?.sender === 'user' && <LoadingSpinner text="Generating more ideas..." />}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
                      </div>
                      <div className="mt-4">
                          <ChatInterface
                              messages={chatMessages.filter(msg => msg.sender === 'user' || msg.metadata?.ideas)}
                              onSendMessage={handleSendMessage}
                              isLoading={isLoading}
                              promptLabel={"Refine ideas or ask for more variations:"}
                              initialHelperText={"Ideas displayed above. You can ask for refinements or more ideas based on these."}
                          />
                      </div>
                  </div>
              )}
          </div>
        )}

        {currentPhase === SprintPhase.Prototype && (
            <div>
              <ChatInterface
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  promptLabel={currentPhaseConfig.userPromptLabel}
                  initialHelperText={currentPhaseConfig.initialHelperText}
              />
              {generatedPrototypeSpec && (
                  <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-3 text-[#85A684]">Generated Prototype Specification:</h3>
                      <SummaryDisplay summary={generatedPrototypeSpec} />
                  </div>
              )}
            </div>
        )}
        
        {currentPhase === SprintPhase.Test && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Prototype Images</h3>
              <ImageUploader onFilesChange={handlePrototypeImagesChange} />
              <div className="mt-4">
                <ChatInterface
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    promptLabel={currentPhaseConfig.userPromptLabel}
                    initialHelperText={currentPhaseConfig.initialHelperText}
                    showInputArea={prototypeImages.length > 0 || chatMessages.length > 1}
                />
              </div>
            </div>
        )}


        <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Checkpoint & Summary</h3>
            <p className="text-sm text-gray-600 mb-4">
                Generate a summary of this phase's activities to copy and carry forward to the next step.
            </p>
            <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing || (chatMessages.length === 0 && generatedIdeas.length === 0 && !problemStatementInput && !generatedPrototypeSpec)}
                className="inline-flex items-center px-4 py-2 bg-[#85A684] text-white font-semibold rounded-lg shadow-md hover:bg-[#749573] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#85A684] disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isSummarizing ? (
                    <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Generating...</span>
                    </>
                ) : 'Generate Phase Summary'}
            </button>

            {isSummarizing && !currentSummary && <div className="mt-4"><p className="text-sm text-gray-600">The AI is creating your summary. This might take a moment...</p></div>}
            
            {currentSummary && (
                <SummaryDisplay summary={currentSummary} />
            )}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Header />
      <PhaseSelector phases={PHASE_CONFIGS} currentPhase={currentPhase} onSelectPhase={handleSelectPhase} />
      <main className="container mx-auto p-4 flex-grow w-full max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h2 className="text-2xl font-semibold mb-1 text-[#85A684]">{currentPhaseConfig.title}</h2>
          <p className="text-sm text-gray-500 mb-6">{currentPhaseConfig.description}</p>
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
