import { test, expect } from '@playwright/test';

test.describe('Code Execution Engine', () => {
  // These tests verify the API endpoint directly. 
  // In a real environment, we'd mock Supabase and Judge0 via Route handlers 
  // or test against a staging environment. For this test, we expect 401 
  // because we are not authenticated in the E2E runner.

  test('should reject execution without authentication', async ({ request }) => {
    const response = await request.post('/api/execute', {
      data: {
        code: 'print("Hello World")',
        language: 'python'
      }
    });

    expect(response.status()).toBe(401);
  });
});
