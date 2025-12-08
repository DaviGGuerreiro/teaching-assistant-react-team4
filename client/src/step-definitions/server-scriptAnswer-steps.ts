import { Given, When, Then, After, setDefaultTimeout } from '@cucumber/cucumber';
import expect from 'expect';

// Set default timeout for all steps
setDefaultTimeout(30 * 1000); // 30 seconds

const serverUrl = 'http://localhost:3005';

// Test data to clean up
let lastResponse: Response;
let createdScriptAnswerIds: string[] = [];
let createdStudentCPF: string | null = null;

After({ tags: '@server' }, async function () {
  // Clean up created script answers if needed
  if (createdScriptAnswerIds.length > 0) {
    for (const id of createdScriptAnswerIds) {
      try {
        await fetch(`${serverUrl}/api/scriptanswers/${id}`, {
          method: 'DELETE'
        });
        console.log(`Server cleanup: Removed test script answer with ID: ${id}`);
      } catch (error) {
        console.log(`Server cleanup: Could not remove script answer ${id}`);
      }
    }
    createdScriptAnswerIds = [];
  }

  // Clean up created student if needed
  if (createdStudentCPF) {
    try {
      await fetch(`${serverUrl}/api/students/${createdStudentCPF}`, {
        method: 'DELETE'
      });
      console.log(`Server cleanup: Removed test student with CPF: ${createdStudentCPF}`);
    } catch (error) {
      console.log(`Server cleanup: Could not remove student ${createdStudentCPF}`);
    }
    createdStudentCPF = null;
  }
});

// ============================================================
// Retrieval of all script answers
// ============================================================

Given('there are script answers registered with IDs {string}, {string}, {string}', async function (string1, string2, string3) {
  // Parse the comma-separated IDs from the string
  const ids = [string1, string2, string3].map(id => id.replace(/"/g, ''));
  
  // Create script answers with the given IDs
  for (const id of ids) {
    try {
      const response = await fetch(`${serverUrl}/api/scriptanswers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          scriptId: `script-${id}`,
          studentId: '11111111111',
          answers: []
        })
      });
      
      if (response.status === 201) {
        createdScriptAnswerIds.push(id);
        console.log(`Server setup: Created script answer with ID: ${id}`);
      } else {
        console.error(`Failed to create script answer ${id}: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to create script answer ${id}:`, error);
    }
  }
});

Given('there are no script answers registered', async function () {
  // Fetch all script answers and delete them
  try {
    const response = await fetch(`${serverUrl}/api/scriptanswers/`);
    if (response.status === 200) {
      const answers = await response.json();
      
      for (const answer of answers) {
        await fetch(`${serverUrl}/api/scriptanswers/${answer.id}`, {
          method: 'DELETE'
        });
        console.log(`Server setup: Removed existing script answer with ID: ${answer.id}`);
      }
    }
  } catch (error) {
    console.log('Server setup: Could not clean up existing script answers');
  }
});

// ============================================================
// Retrieval by student (CPF-based)
// ============================================================

Given('there is a student with CPF {string}', async function (cpf: string) {
  try {
    const response = await fetch(`${serverUrl}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        cpf: cpf,
        email: `student${cpf}@test.com`
      })
    });

    const get = await fetch(`${serverUrl}/api/students/${cpf}`)
    expect(get.status).toBe(200);

    if (response.status === 201) {
      createdStudentCPF = cpf;

      console.log(`Server setup: Created student with CPF: ${cpf}`);
    } else {
      console.error(`Failed to create student with CPF ${cpf}: Status ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to create student with CPF ${cpf}:`, error);
  }
});

Given('this student has script answers with IDs {string}, {string}, {string}', async function (string1, string2, string3) {
  if (!createdStudentCPF) {
    throw new Error('No student has been created yet. Use "Given there is a student with CPF" first.');
  }

  // Parse the comma-separated IDs from the string
  const ids = [string1, string2, string3 ].map(id => id.replace(/"/g, ''));

  // Create script answers for the student with the given IDs
  for (const id of ids) {
    try {
      const response = await fetch(`${serverUrl}/api/scriptanswers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          scriptId: `script-${id}`,
          studentId: createdStudentCPF,
          answers: []
        })
      });

      if (response.status === 201) {
        createdScriptAnswerIds.push(id);
        console.log(`Server setup: Created script answer with ID: ${id} for student ${createdStudentCPF}`);
      } else {
        console.error(`Failed to create script answer ${id}: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to create script answer ${id}:`, error);
    }
  }
});

Given('there is no student with CPF {string}', async function (cpf: string) {
  // Verify that no student with this CPF exists
  try {
    const response = await fetch(`${serverUrl}/api/students/${cpf}`);
    
    if (response.status === 200) {
      throw new Error(`Student with CPF ${cpf} already exists. Please use a different CPF.`);
    } else if (response.status === 404) {
      console.log(`Server setup: Confirmed no student with CPF ${cpf} exists`);
    }
  } catch (error) {
    if ((error as Error).message.includes('already exists')) {
      throw error;
    }
    // If there's a network error, we'll proceed anyway
    console.log(`Server setup: Could not verify student non-existence for CPF ${cpf}`);
  }
});

When('I send a GET request to {string}', async function (endpoint: string) {
  try {
    lastResponse = await fetch(`${serverUrl}${endpoint}`);
    console.log(`Server test: GET request to ${endpoint} returned status ${lastResponse.status}`);
  } catch (error) {
    throw new Error(`Failed to send GET request to ${endpoint}: ${error}`);
  }
});

Then(/^the server should return (\d+) (.+)$/, async function (statusCode: string, message: string) {
  const code = parseInt(statusCode);
  expect(lastResponse.status).toBe(code);
  console.log(`Server test: Confirmed response status is ${code} ${message}`);
});
Then('the server should return a list containing answers {string}, {string}, {string}', async function (string1: string, string2: string, string3: string) {
  const expectedIds = [string1, string2, string3].map(id => id.replace(/"/g, ''));
  
  const responseBody = await lastResponse.json();
  expect(Array.isArray(responseBody)).toBe(true);
  
  const returnedIds = responseBody.map((answer: any) => answer.id);
  
  // Verify all expected IDs are in the response
  for (const expectedId of expectedIds) {
    expect(returnedIds).toContain(expectedId);
  }
  
  console.log(`Server test: Verified response contains answers: ${expectedIds.join(', ')}`);
});




Then('the server should return an empty list', async function () {
  const responseBody = await lastResponse.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBe(0);
  
  console.log('Server test: Confirmed response is an empty list');
});

Then('the server should return an error message {string}', async function (string) {
  const responseBody = await lastResponse.json();
  expect(responseBody.error).toBeDefined();
  expect(responseBody.error.toLowerCase()).toContain(string);
  
  console.log(`Server test: Confirmed error message: ${responseBody.error}`);
});