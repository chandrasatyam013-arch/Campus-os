import React from 'react';
import { Bot } from 'lucide-react';
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

import { Capacitor } from '@capacitor/core';

export const AIChatView: React.FC = () => {
  const runtimeUrl = Capacitor.isNativePlatform() 
    ? 'https://campus-os-pi.vercel.app/api/copilotkit' 
    : '/api/copilotkit';

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full flex flex-col h-full min-h-[80vh] md:pb-8 pb-32">
      <div className="flex items-center gap-3 mb-8 pt-safe">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Assistant</h1>
          <p className="text-xs text-gray-500 mt-1">Your personal academic intelligence copilot</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-100 rounded-[32px] overflow-hidden flex flex-col shadow-sm">
        <CopilotKit runtimeUrl={runtimeUrl}>
          <CopilotChat
            instructions={`You are the user's personal Campus OS academic assistant/copilot. 
Your primary goal is to use the available secure backend tools to answer personal academic questions (e.g. attendance, SGPA, grades, subjects, assignments).
CRITICAL RULES:
1. ALWAYS use the provided tools to retrieve data FIRST before answering. 
2. NEVER ask the user to manually provide their subjects, attendance, marks, assignments, timetable, user ID, or account ID. The tools will securely fetch this using their session automatically.
3. Use the 'getMyAcademicProfile' tool to fetch the user's canonical academic data, which perfectly matches the dashboard (including attendance, SGPA, pending assignments, schedule).
29. If the user asks about their career, what career suits them, or their roadmap progress, ALWAYS call the 'getMyCareerRoadmap' tool first.
30. If the user asks "What should I focus on today?", "What are my priorities?", or "What should I do?", ALWAYS call the 'getMyRecommendations' tool to fetch the deterministic priority list.
31. If a tool returns no data or insufficient data for a question, respond honestly. Do NOT invent or estimate data.
32. Do NOT over-promise or make up numbers. Use only the PostgreSQL data returned by the tools.
33. If the user asks a general question (e.g. "Explain DBMS normalization"), answer normally without using tools.
34. Always identify yourself as the Campus OS academic assistant/copilot, not a generic AI.`}
            labels={{
              title: "Campus OS Assistant",
              initial: "Hi! How can I help you with your academics today?",
            }}
          />
        </CopilotKit>
      </div>
    </div>
  );
};
