import { Question } from './Question';

export class Script {
  private id: string;
  public title?: string;
  public description?: string;
  public questions: Question[];

  constructor(id: string, title?: string, description?: string, questions: Question[] = []) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.questions = questions;
  }

  getId(): string {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      questions: this.questions,
    };
  }

  update(data: Partial<{ title: any; description: any }>) {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
  }

  static fromJSON(obj: any): Script {
    return new Script(obj.id, obj.title, obj.description, obj.questions);
  }
}