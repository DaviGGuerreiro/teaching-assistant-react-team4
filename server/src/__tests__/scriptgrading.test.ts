import request from 'supertest';
import { app, scriptAnswerSet, studentSet } from '../server';
import { Student } from '../models/Student';

describe('Server API – Script Answers Endpoints', () => {

  // Clean state before each test
  beforeEach(() => {
    // Clear students
    const allStudents = studentSet.getAllStudents();
    allStudents.forEach(s => studentSet.removeStudent(s.getCPF()));

    // Clear script answers
    const allAnswers = scriptAnswerSet.getAll();
    allAnswers.forEach(a => scriptAnswerSet.removeScriptAnswer(a.id));
    expect(scriptAnswerSet.getAll().length).toBe(0);
  });

  // ----------------------------------------------------------
  // 1) Recuperar todas as respostas cadastradas
  // ----------------------------------------------------------

  test('GET /api/scripts/answers → returns all registered answers', async () => {
    scriptAnswerSet.addScriptAnswer({ id: '123', scriptId: '1', studentId: 'S1' });
    scriptAnswerSet.addScriptAnswer({ id: '321', scriptId: '2', studentId: 'S2' });
    scriptAnswerSet.addScriptAnswer({ id: '890', scriptId: '3', studentId: 'S3' });

    const res = await request(app).get('/api/scripts/answers');

    expect(res.status).toBe(200);
    const ids = res.body.map((a: any) => a.id);
    expect(ids).toContain('123');
    expect(ids).toContain('321');
    expect(ids).toContain('890');
  });

  // ----------------------------------------------------------
  // 2) Recuperar respostas quando não há nenhuma cadastrada
  // ----------------------------------------------------------

  test('GET /api/scripts/answers → returns empty list when none exist', async () => {
    const res = await request(app).get('/api/scripts/answers');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // ----------------------------------------------------------
  // 3) Recuperar respostas de um aluno cadastrado
  // ----------------------------------------------------------

  test('GET /api/scripts/answers/student/:studentId → returns answers of a specific student', async () => {
    studentSet.addStudent(new Student('Alice', '15029035478', 'alice@gmail.com'));
    scriptAnswerSet.addScriptAnswer({ id: '40', scriptId: '1', studentId: '15029035478' });
    scriptAnswerSet.addScriptAnswer({ id: '41', scriptId: '2', studentId: '15029035478' });
    scriptAnswerSet.addScriptAnswer({ id: '999', scriptId: 'X', studentId: 'other' });

    const res = await request(app).get('/api/scripts/answers/student/15029035478');

    expect(res.status).toBe(200);
    const ids = res.body.map((a: any) => a.id);
    expect(ids).toEqual(['40', '41']);
  });

  // ----------------------------------------------------------
  // 4) Tentar recuperar respostas de aluno não cadastrado
  // ----------------------------------------------------------

  test('GET /api/scripts/answers/student/:studentId → returns 404 if student not found', async () => {
    const res = await request(app).get('/api/scripts/answers/student/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Student not found');
  });

  // ----------------------------------------------------------
  // 5) Recuperar a nota de uma questão existente
  // ----------------------------------------------------------

  test('GET /api/scripts/answers/:id/tasks/:taskId → returns grade for existing task', async () => {
    scriptAnswerSet.addScriptAnswer({
      id: '50',
      scriptId: '1',
      studentId: 'stu',
      taskAnswers: [
        { id: 'TA2', taskId: '2', grade: 'MA', comments: '' }
      ]
    });

    const res = await request(app).get('/api/scripts/answers/50/tasks/2');

    expect(res.status).toBe(200);
    expect(res.body.grade).toBe('MA');
  });

  // ----------------------------------------------------------
  // 6) Nota de questão inexistente
  // ----------------------------------------------------------

  test('GET /api/scripts/answers/:id/tasks/:taskId → returns 404 for missing task', async () => {
    scriptAnswerSet.addScriptAnswer({
      id: '50',
      scriptId: '1',
      studentId: 'stu',
      taskAnswers: [
        { id: 'TA2', taskId: '2', grade: 'MA', comments: '' }
      ]
    });

    const res = await request(app).get('/api/scripts/answers/50/tasks/9');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });
});
