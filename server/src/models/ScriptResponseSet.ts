import { ScriptResponse } from './ScriptResponse';
import { Script } from './Script';
import { Enrollment } from './Enrollment';
export class ScriptResponseSet {
  private items: ScriptResponse[] = [];

  addScriptResponse(data: {
    id?: string;
    script: Script;
    enrollment: Enrollment;
    started_at?: number;
    finished_at?: number;
    status?: 'in_progress' | 'finished';
    answers?: any[];
  }): ScriptResponse {
    const id = `${data.enrollment.getStudent().getCPF()}-${data.script.getId()}`;
    const scriptresponse = new ScriptResponse(id, data.script, data.enrollment, data.started_at);
    if (data.finished_at !== undefined) scriptresponse.update({ finished_at: data.finished_at });
    if (data.status !== undefined) scriptresponse.update({ status: data.status });
    if (data.answers !== undefined) scriptresponse.update({ answers: data.answers });
    this.items.push(scriptresponse);
    return scriptresponse;
  }

  getAllScriptResponses(): ScriptResponse[] {
    return this.items;
  }

  findById(id: string): ScriptResponse | undefined {
    return this.items.find(r => r.getId() === id);
  }

  updateScriptResponse(id: string, data: any): ScriptResponse | undefined {
    const scriptresponse = this.findById(id);
    if (!scriptresponse) return undefined;
    scriptresponse.update(data);
    return scriptresponse;
  }

  findByStudentAndScript(enrollment: Enrollment, script: Script): ScriptResponse | undefined {
    const studentCPF = enrollment.getStudent().getCPF();
    const scriptId = script.getId();
    return this.items.find(r =>
      r.enrollment.getStudent().getCPF() === studentCPF &&
      r.script.getId() === scriptId
    );
  }

  createOrGetActiveScriptResponse(enrollment: Enrollment, script: Script): ScriptResponse {
    const existing = this.findByStudentAndScript(enrollment, script);
    if (existing && existing.status === 'in_progress') return existing;
    return this.addScriptResponse({ script, enrollment, started_at: Date.now() });
  }
}