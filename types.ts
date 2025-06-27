
import React from 'react';

export enum SprintPhase {
  Understand = 'Understand',
  Define = 'Define',
  Sketch = 'Sketch',
  Decide = 'Decide',
  Prototype = 'Prototype',
  Test = 'Test',
}

export interface PhaseConfig {
  id: SprintPhase;
  title: string;
  description: string;
  icon: React.ReactNode;
  userPromptLabel: string;
  aiSystemInstruction?: (param1?: string, param2?: string) => string;
  initialHelperText?: string | React.ReactNode;
  requiresPersonaInput?: boolean;
  requiresProblemStatementInput?: boolean;
  requiresPrototypeDescriptionInput?: boolean;
  allowsImageUpload?: boolean; // Future use for image input to multimodal models
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  metadata?: {
    ideas?: Idea[];
    groundingChunks?: GroundingChunk[];
  };
}

export interface Idea {
  id: string;
  text: string;
  category?: string;
  impact?: 'High' | 'Medium' | 'Low';
  effort?: 'High' | 'Medium' | 'Low';
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
