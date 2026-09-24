import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock Next.js Request/Response
class MockRequest {
  body: any;
  constructor(body: any) {
    this.body = body;
  }
  async json() {
    return this.body;
  }
}

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

import { createClient } from '@/lib/supabase/server';

describe('POST /api/execute', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const req = new MockRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('should run code and hide expected output for failing hidden test cases', async () => {
    (createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { input: '1 2', expected_output: '3', is_hidden: false },
              { input: '4 5', expected_output: '9', is_hidden: true },
            ],
            error: null,
          }),
        }),
      }),
    });

    // Mock fetch for Piston API
    let fetchCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      fetchCount++;
      if (fetchCount === 1) {
        // First test case (passes)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ run: { code: 0, output: '3' } }),
        });
      } else {
        // Second test case (fails)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ run: { code: 0, output: '8' } }),
        });
      }
    });

    const req = new MockRequest({ code: 'print("3")\nprint("8")', language: 'python', problem_id: '123e4567-e89b-12d3-a456-426614174000' });
    const res = await POST(req as any);
    
    expect(res.status).toBe(200);
    const json = await (res as any).json();
    
    expect(json.results).toHaveLength(2);
    
    // First test case (public, passed)
    expect(json.results[0].passed).toBe(true);
    expect(json.results[0].expected).toBe('3');
    
    // Second test case (hidden, failed)
    expect(json.results[1].passed).toBe(false);
    expect(json.results[1].expected).toBe('Hidden');
    expect(json.results[1].input).toBe('Hidden');
    expect(json.results[1].output).toBe('Hidden output');
  });
});
