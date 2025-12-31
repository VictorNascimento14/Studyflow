
export interface Subject {
  id: number;
  name: string;
  missedClasses: number;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface LinkResource {
  id: number;
  title: string;
  url: string;
  category: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface SummaryResult {
  topic: string;
  summary: string;
  learningObjectives: {
    id: number;
    text: string;
    priority: 'Alta' | 'Média' | 'Baixa';
  }[];
}

export type NoteColor = 'yellow' | 'purple' | 'white' | 'blue' | 'green' | 'pink' | 'orange';

export interface CourseNote {
  id: string | number;
  timestamp: string;
  content: string;
  color: NoteColor;
  rotationClass: string;
}

export interface UnitLink {
  title: string;
  url: string;
}