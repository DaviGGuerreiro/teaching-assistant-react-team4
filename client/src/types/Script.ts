import {Question} from './Question'
export interface Script {
  id: string;
  title?: string;
  //content?: any;
  description?: string;
  questions: Question[];
}

export interface CreateScriptRequest {
  title?: string;
  content?: any;
}

export interface UpdateScriptRequest {
  title?: string;
  content?: any;
}

export const isValidJSON = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};
