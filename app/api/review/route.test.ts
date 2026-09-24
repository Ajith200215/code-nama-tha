/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Mock Google GenAI
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: 'This is a mocked AI review response. The time complexity is O(N).'
        })
      };
    }
  };
});

import { createClient } from '@/lib/supabase/server';

describe('POST /api/review', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.GEMINI_API_KEY = 'mock-key';
  });

  it('should return 401 if user is not authenticated', async () => {
    (createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const req = new MockRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('should return a generated AI review', async () => {
    (createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
    });

    const req = new MockRequest({ code: 'print("hello")', language: 'python', problem_title: 'Hello World' });
    const res = await POST(req as any);
    
    expect(res.status).toBe(200);
    const json = await (res as any).json();
    
    expect(json.review).toContain('mocked AI review response');
  });
});
