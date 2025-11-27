import { Task } from "./Task";
import { Grade } from "./Evaluation";

export class TaskAnswer {
  public task: Task;
  private grade?: Grade;
  public comments?: string;

  constructor(task: Task, grade?: Grade, comments?: string) {
    this.task = task;
    this.grade = grade;
    this.comments = comments;
  }

  getTaskId(): string {
    return this.task.getId();
  }

  toJSON() {
    return {
      task: this.task.toJSON(),
      grade: this.grade ? this.grade : undefined,
      comments: this.comments
    };
  }

  update(data: Partial<{task: any; grade: any; comments: any }>) {
    if (data.task) this.task = Task.fromJSON(data.task);
    if (data.grade !== undefined) this.grade = data.grade;
    if (data.comments !== undefined) this.comments = data.comments;
  }

  static fromJSON(obj: any): TaskAnswer {
    return new TaskAnswer(obj.task, obj.grade, obj.comments);
  }

  getGrade(): Grade | undefined {
    return this.grade;
  }
}

