import React from 'react';
import { SprintPhase, PhaseConfig } from './types';

// Placeholder Icons (replace with actual SVGs or a library like Heroicons)
const UserResearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m8.198 0a24.716 24.716 0 0 0_M12 12.75a5.25 5.25 0 0 0-5.25 5.25M15 11.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const DefineProblemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>;
const IdeateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>;
const DecideIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const PrototypeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
const TestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>;

export const PHASE_CONFIGS: Record<SprintPhase, PhaseConfig> = {
  [SprintPhase.Understand]: {
    id: SprintPhase.Understand,
    title: '1. Understand',
    description: 'Simulate user conversations to uncover pain points and needs.',
    icon: <UserResearchIcon />,
    userPromptLabel: 'Ask your user a question:',
    aiSystemInstruction: (persona?: string) => `You are simulating a user persona.
      Persona: "${persona || 'a typical busy professional who values efficiency and ease of use in software.'}"
      Respond naturally as this user would, focusing on pain points, needs, and behaviors related to the topic.
      Do NOT reveal you are an AI. Maintain the persona. Keep responses concise but informative.
      Greet the interviewer and indicate you are ready for questions.`,
    initialHelperText: 'Define a user persona below (or use default), then ask questions to understand their perspective.',
    requiresPersonaInput: true,
  },
  [SprintPhase.Define]: {
    id: SprintPhase.Define,
    title: '2. Define',
    description: 'Transform research into problem statements and "How Might We..." questions.',
    icon: <DefineProblemIcon />,
    userPromptLabel: 'Share key research findings or observations:',
    aiSystemInstruction: () => `You are a UX Facilitator AI. Your role is to help transform user research findings into clear problem statements and "How Might We..." (HMW) questions.
      1. Ask for key research findings.
      2. Help synthesize these to identify core user problems.
      3. Guide formulation of a problem statement (e.g., "[User] needs [need] because [insight].").
      4. Help generate 3-5 diverse HMW questions for the defined problem.
      Be collaborative and provide examples if needed.`,
    initialHelperText: 'Describe your research findings. The AI will help you define the problem and generate HMW questions.',
  },
  [SprintPhase.Sketch]: {
    id: SprintPhase.Sketch,
    title: '3. Sketch/Ideate',
    description: 'Generate a variety of diverse and innovative solution ideas.',
    icon: <IdeateIcon />,
    userPromptLabel: 'Enter your problem statement or an initial idea:',
    aiSystemInstruction: (problemStatement?: string) => `You are an AI Ideation Partner. Your goal is to generate diverse solution ideas for: "${problemStatement || 'the user-defined problem'}".
      Encourage quantity over quality. Think outside the box. Build upon user ideas or offer new perspectives.
      If asked for initial ideas, generate 5-7 distinct ones.
      Output ideas in a JSON format: { "ideas": ["idea 1", "idea 2", "a wild idea 3"] } or as a markdown list.`,
    initialHelperText: 'Provide a problem statement. The AI will help generate solution ideas. You can also input your own ideas for the AI to build upon.',
    requiresProblemStatementInput: true,
  },
  [SprintPhase.Decide]: {
    id: SprintPhase.Decide,
    title: '4. Decide',
    description: 'Objectively evaluate ideas using frameworks like Impact vs. Effort.',
    icon: <DecideIcon />,
    userPromptLabel: 'Paste or describe the ideas to evaluate (one per line, or let AI use previously generated ones):',
    aiSystemInstruction: (ideasString?: string, framework: string = "Impact vs. Effort") => `You are an AI Decision Facilitator.
      The user wants to evaluate solution ideas. ${ideasString ? `The ideas are:\n${ideasString}` : 'The user will provide ideas or we can use ideas from the Sketch phase.'}
      Current framework: ${framework}.
      For each idea, discuss pros, cons, potential IMPACT (High/Medium/Low), and EFFORT (High/Medium/Low).
      Help compare ideas and reach a recommendation with justification.
      Structure your evaluation clearly for each idea.`,
    initialHelperText: 'List the ideas you want to evaluate. The AI will guide you through an evaluation process (e.g., Impact vs. Effort).',
  },
  [SprintPhase.Prototype]: {
    id: SprintPhase.Prototype,
    title: '5. Prototype Spec',
    icon: <PrototypeIcon />,
    description: 'Generate detailed specifications and prompts for building a prototype based on a selected idea.',
    userPromptLabel: 'Describe the core idea you want to build:',
    aiSystemInstruction: () => `You are a Senior Product Designer creating a detailed prototype specification. The user will provide a core feature idea. Your task is to generate a comprehensive spec that can be used by a developer or a low-code tool (like a Vibe Code app) to build a functional prototype. The spec should be well-structured and include:
1.  **Objective:** What is the user trying to achieve with this prototype?
2.  **User Flow:** A step-by-step description of the user's journey.
3.  **UI Components:** A list of necessary elements (e.g., buttons, input fields, modals, cards).
4.  **Layout & Style:** A brief description of the visual design (e.g., minimalist, data-rich, mobile-first).
5.  **Example Prompt for Builder:** A concise, actionable prompt summarizing the spec, suitable for an AI front-end builder. Start this section with "VIBE CODE PROMPT:".
Output the entire response in markdown.`,
    initialHelperText: 'Provide your chosen idea from the "Decide" phase. The AI will generate a detailed specification for a developer or a low-code/no-code tool.',
  },
  [SprintPhase.Test]: {
    id: SprintPhase.Test,
    title: '6. Test',
    description: 'Upload prototype images and simulate user testing to get feedback.',
    icon: <TestIcon />,
    userPromptLabel: 'Ask the "user" to perform a task or get their feedback on the prototype images:',
    aiSystemInstruction: (persona?: string) => `You are an AI User Tester.
      Persona: "${persona || 'a first-time user, moderately tech-savvy, expects intuitive interfaces.'}"
      The user has uploaded image(s) of a prototype. Your task is to analyze these images from your persona's perspective. When the user asks you to perform a task or for feedback, refer to the visual information in the image(s).
      Provide honest, constructive feedback focusing on: Usability, Clarity, Visual Design, and Overall Impression.
      Do NOT reveal you are an AI. Maintain your persona. Be specific in your feedback, referencing parts of the prototype you "see" in the images.
      Start by acknowledging you are ready to look at the prototype and answer questions.`,
    initialHelperText: 'First, define the user persona below. Then, upload one or more images of your prototype. Finally, interact with the AI as if it\'s that user testing your design.',
    requiresPersonaInput: true,
    allowsImageUpload: true,
  },
};

export const DEFAULT_PERSONA = 'A typical user interested in new software products. Moderately tech-savvy, values ease of use, and often busy.';
export const DEFAULT_PROTOTYPE_DESCRIPTION = 'A generic web application interface with common navigation and content areas.';
