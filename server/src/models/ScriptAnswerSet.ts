import { v4 as uuid } from 'uuid';

export class ScriptAnswerSet {
  private scriptAnswers: any[] = [];

  addScriptAnswer(data: any) {
    const newAnswer = {
      id: uuid(),
      scriptId: data.scriptId,
      studentId: data.studentId,
      taskAnswers: data.taskAnswers ?? [],
      grade: data.grade ?? null
    };
    this.scriptAnswers.push(newAnswer);
    return newAnswer;
  }

  getAll() {
    return this.scriptAnswers;
  }

  findByStudentId(studentId: string) {
    return this.scriptAnswers.filter(a => a.studentId === studentId);
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
