
/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";


// Initialize GoogleGenAI lazily or with a check to avoid crashing if the key is missing.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;



export interface AIStudyPlan {
  title: string;
  description: string;
  weeklySchedule: {
    day: string;
    topics: {
      subject: string;
      subtopic: string;
      duration: string;
      priority: 'Alta' | 'Média' | 'Baixa';
      tips: string;
    }[];
  }[];
  generalTips: string[];
}

export const generateStudyPlanAI = async (
  subjects: string[],
  availableHours: number,
  goal: string
): Promise<AIStudyPlan | null> => {
  if (!ai) {
    console.error("Gemini AI not initialized. Missing VITE_GEMINI_API_KEY.");
    return null;
  }
  const prompt = `
    Você é um consultor pedagógico de elite especialista em técnicas de estudo acelerado (como Feynman, Pomodoro e Espaçamento).
    Seu objetivo é criar um plano de estudo de recuperação intensiva para um estudante.

    DADOS DO ESTUDANTE:
    - Disciplinas/Temas Atrasados: ${subjects.join(', ')}
    - Horas disponíveis por dia: ${availableHours}h
    - Objetivo: ${goal}

    REQUISITOS DO PLANO:
    1. Organize uma rotina semanal (7 dias).
    2. Distribua os temas de forma estratégica (intercalando matérias difíceis e fáceis).
    3. Para cada dia, defina tópicos específicos, duração sugerida e uma dica técnica de estudo.
    4. O plano deve ser realista e focado em máxima retenção em pouco tempo.

    Responda EXCLUSIVAMENTE em formato JSON seguindo esta estrutura:
    {
      "title": "Título Motivador do Plano",
      "description": "Breve análise da situação do aluno",
      "weeklySchedule": [
        {
          "day": "Segunda-feira",
          "topics": [
            { "subject": "Nome da Matéria", "subtopic": "O que focar exatamente", "duration": "1h 30min", "priority": "Alta", "tips": "Use a técnica X" }
          ]
        }
      ],
      "generalTips": ["Dica 1", "Dica 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            weeklySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        subject: { type: Type.STRING },
                        subtopic: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        priority: { type: Type.STRING },
                        tips: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
            },
            generalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIStudyPlan;
    }
    return null;
  } catch (error) {
    console.error("Error generating AI study plan:", error);
    return null;
  }
};
