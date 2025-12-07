import { TaskAnswer } from "../models/TaskAnswer";
import { Task } from "../models/Task";
import { Grade } from "../models/Evaluation";

describe("TaskAnswer", () => {
  let task: Task;

  beforeEach(() => {
    task = new Task("t1", "Example Task");
  });

  // ---------------------------------------------------------------
  test("constructor initializes fields correctly", () => {
    const ta = new TaskAnswer("a1", task, "my answer", "MA", "good job");

    expect(ta.id).toBe("a1");
    expect(ta.task).toBe(task);
    expect(ta.answer).toBe("my answer");
    expect(ta.getGrade()).toBe("MA");
    expect(ta.comments).toBe("good job");
  });

  // ---------------------------------------------------------------
  test("constructor throws on invalid grade", () => {
    expect(() => {
      new TaskAnswer("a1", task, "ans", "INVALID" as Grade);
    }).toThrow("Invalid grade value");
  });

  test("constructor accepts undefined grade", () => {
    const ta = new TaskAnswer("a1", task, "x", undefined);
    expect(ta.getGrade()).toBeUndefined();
  });

  // ---------------------------------------------------------------
  test("getTaskId() returns task id", () => {
    const ta = new TaskAnswer("a1", task);
    expect(ta.getTaskId()).toBe("t1");
  });

  // ---------------------------------------------------------------
  test("toJSON() returns correct structure", () => {
    const ta = new TaskAnswer("a1", task, "answer", "MPA");

    expect(ta.toJSON()).toEqual({
      id: "a1",
      task: {
        id: "t1",
        statement: "Example Task",
      },
      answer: "answer",
      grade: "MPA",
      comments: undefined,
    });
  });

  test("toJSON() omits grade when undefined", () => {
    const ta = new TaskAnswer("a1", task, "ans", undefined);

    expect(ta.toJSON()).toEqual({
      id: "a1",
      task: {
        id: "t1",
        statement: "Example Task",
      },
      answer: "ans",
      grade: undefined,
      comments: undefined,
    });
  });

  // ---------------------------------------------------------------
  describe("updateGrade()", () => {
    test("updates grade correctly", () => {
      const ta = new TaskAnswer("a1", task);
      ta.updateGrade("MANA");

      expect(ta.getGrade()).toBe("MANA");
    });

    test("removes grade when passed undefined", () => {
      const ta = new TaskAnswer("a1", task, "x", "MA");
      ta.updateGrade(undefined);

      expect(ta.getGrade()).toBeUndefined();
    });

    test("throws on invalid grade", () => {
      const ta = new TaskAnswer("a1", task);

      expect(() => ta.updateGrade("BAD" as Grade)).toThrow("Invalid grade value");
    });
  });

  // ---------------------------------------------------------------
  describe("update()", () => {
    test("updates answer", () => {
      const ta = new TaskAnswer("a1", task);
      ta.update({ answer: "new answer" });

      expect(ta.answer).toBe("new answer");
    });

    test("updates comments", () => {
      const ta = new TaskAnswer("a1", task);
      ta.update({ comments: "hello" });

      expect(ta.comments).toBe("hello");
    });

    test("updates grade", () => {
      const ta = new TaskAnswer("a1", task);
      ta.update({ grade: "MPA" });

      expect(ta.getGrade()).toBe("MPA");
    });

    test("throws on invalid grade", () => {
      const ta = new TaskAnswer("a1", task);

      expect(() => ta.update({ grade: "WRONG" as Grade }))
        .toThrow("Invalid grade value");
    });

    test("updates task via fromJSON()", () => {
      const ta = new TaskAnswer("a1", task);
      ta.update({ task: { id: "t2", statement: "New task" } });

      expect(ta.getTaskId()).toBe("t2");
      expect(ta.task.toJSON()).toEqual({
        id: "t2",
        statement: "New task",
      });
    });
  });

  // ---------------------------------------------------------------
  describe("fromJSON()", () => {
    test("creates TaskAnswer instance from JSON", () => {
      const json = {
        id: "a1",
        task: task,
        answer: "ans",
        grade: "MA",
        comments: "ok",
      };

      const ta = TaskAnswer.fromJSON(json);

      expect(ta.id).toBe("a1");
      expect(ta.answer).toBe("ans");
      expect(ta.getGrade()).toBe("MA");
      expect(ta.comments).toBe("ok");
      expect(ta.task).toBe(task); // because constructor receives the task directly
    });
  });

  // ---------------------------------------------------------------
  test("getGrade() returns internal grade", () => {
    const ta = new TaskAnswer("a1", task, "ans", "MANA");
    expect(ta.getGrade()).toBe("MANA");
  });
});
