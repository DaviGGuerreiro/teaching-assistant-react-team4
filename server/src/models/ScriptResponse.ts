import { Answer } from './Answer';
import { Class } from './Class';
import { Script } from './Script';
import { Enrollment } from './Enrollment';
import { Task } from './Task';
import { Scripts } from './Scripts';
export class ScriptResponse {
  private id: string;
  public script: Script;
  public enrollment: Enrollment;
  public started_at?: number;
  public finished_at?: number;
  public status: 'in_progress' | 'finished' = 'in_progress';
  public answers: Answer[] = [];

  constructor(id: string, script: Script, enrollment: Enrollment, started_at?: number) {
    this.id = id;
    this.script = script;
    this.enrollment = enrollment;
    this.started_at = started_at ?? Date.now();
  }

  getId(): string {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id,
      scriptId: this.script.getId(),
      studentCPF: this.enrollment.getStudent().getCPF(),
      started_at: this.started_at,
      finished_at: this.finished_at,
      status: this.status,
      answers: this.answers.map(a => a.toJSON())
    };
  }

  update(data: Partial<{
    finished_at: number;
    status: 'in_progress' | 'finished';
    answers: any[];
  }>) {
    if (data.finished_at !== undefined) this.finished_at = data.finished_at;
    if (data.status !== undefined) this.status = data.status;
    if (data.answers !== undefined) {
      this.answers = data.answers.map((o: any) => Answer.fromJSON(o, this.script.findTaskById(o.taskId)!));
    }
  }

  addOrGetAnswer(task: Task) {
    let ans = this.answers.find(a => a.task.getId() === task.getId());
    if (!ans) {
      const answerId = `${this.id}-${task.getId()}`;
      ans = new Answer(answerId, task);
      ans.started_at = Date.now();
      this.answers.push(ans);
    }
    return ans;
  }

  findAnswerByTaskId(task: Task) {
    return this.answers.find(a => a.task.getId() === task.getId());
  }

  markFinished(finishedAt?: number) {
    this.finished_at = finishedAt ?? Date.now();
    this.status = 'finished';
  }

  static fromJSON(obj: any, scriptSet: Scripts, classObj: Class): ScriptResponse {
    const script = scriptSet.findById(obj.scriptId);
    if(!script) throw new Error(`Script ${obj.scriptId} not found`);
    const enrollment = classObj.findEnrollmentByStudentCPF(obj.studentCPF);
    if (!enrollment) throw new Error(`Enrollment for CPF ${obj.studentCPF} not found`);
    const r = new ScriptResponse(obj.id, script, enrollment, obj.started_at);
    r.finished_at = obj.finished_at;
    r.status = obj.status ?? 'in_progress';
    r.answers = (obj.answers ?? []).map((a: any) => {
      const task = script.findTaskById(a.taskId);
      if (!task) throw new Error(`Task ${a.taskId} not found`);
      return Answer.fromJSON(a, task);
    });
    return r;
  }
}