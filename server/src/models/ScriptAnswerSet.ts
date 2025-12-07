import { v4 as uuid } from 'uuid';

export class ScriptAnswerSet {
  private scriptAnswers: any[] = [];

  addScriptAnswer(data: any) {
    const newAnswer = {
      id: data.id ??  uuid(),
      scriptId: data.scriptId,
      studentId: data.studentId,
      taskAnswers: data.taskAnswers ?? [],
      grade: data.grade ?? null
    };
    this.scriptAnswers.push(newAnswer);
    return newAnswer;
  }

  removeScriptAnswer(id: string) {
    const index = this.scriptAnswers.findIndex(a => a.id === id);
    if (index !== -1) {
      this.scriptAnswers.splice(index, 1);
      return true;
    }
    return false;
  }
  

  getAll() {
    return this.scriptAnswers.slice()
  }

  findByStudentId(studentId: string) {
    return this.getAll().filter(a => a.studentId === studentId).slice();
  }

  findById(id: string) {
    return this.scriptAnswers.find(a => a.id === id) || null;
  }

  updateGrade(id: string, grade: string) {
    const answer = this.findById(id);
    if (!answer) return null;
    answer.grade = grade;
    return answer;
  }

  updateTaskAnswer(taskAnswerId: string, update: any) {
    for (const scriptAnswer of this.scriptAnswers) {
      const ta = scriptAnswer.taskAnswers.find(t => t.id === taskAnswerId);
      if (ta) {
        if (update.grade !== undefined) ta.grade = update.grade;
        if (update.comments !== undefined) ta.comments = update.comments;
        return ta;
      }
    }
    return null;
  }
}
