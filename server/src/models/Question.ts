export class Question {
    private questionId: string;
    public order: number;                 
    public title?: string;               
    public content: string;              
    public type: "multiple-choice" | "true-false" | "open";
    public alternatives?: string[];
    public correctAlternatives?: string[];
    public timeLimit: number;
    constructor(){
        
    }
}