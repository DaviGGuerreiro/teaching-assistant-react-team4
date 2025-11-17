export interface Question {
  questionId: string;                   
  order: number;                
  title?: string;               
  content: string;              
  type: "multiple-choice" | "true-false" | "open";
  alternatives?: string[];
  correctAlternatives?: string[];
  timeLimit: number;
}

