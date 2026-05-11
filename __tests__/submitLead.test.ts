import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitLeadAction } from '@/actions/submitLead';
import { supabaseAdmin } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

global.fetch = vi.fn();

describe('submitLeadAction', () => {
  const createMockFormData = () => {
    const formData = new FormData();
    formData.append('fullName', 'Jane Doe');
    formData.append('email', 'jane@example.com');
    formData.append('company', 'Acme Corp');
    formData.append('source', 'Google');
    formData.append('message', 'Hello!');
    return formData;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Successfully saves lead and triggers webhook', async () => {
    // Setup the mock chain to return a successful DB insert
    (supabaseAdmin.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '123', full_name: 'Jane Doe' },
            error: null,
          }),
        }),
      }),
    });
    
    // Mock successful webhook
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const formData = createMockFormData();
    const result = await submitLeadAction({}, formData);

    // Assertions
    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://webhook-receiver-flax.vercel.app/api/lead-webhook',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Candidate-Name': 'Zachary Bernales', 
        }),
      })
    );
  });

  it('2. Returns an error message if the email is a duplicate (Code 23505)', async () => {
    // Simulate a database constraint error
    (supabaseAdmin.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key value' },
          }),
        }),
      }),
    });

    const formData = createMockFormData();
    const result = await submitLeadAction({}, formData);

    expect(result).toEqual({ error: 'This email has already been submitted.' });
    // Webhook should never be called if the DB insert fails
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('3. Returns success to the user even if the webhook fails completely', async () => {
    // Setup the mock chain to return a successful DB insert
    (supabaseAdmin.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '123' },
            error: null,
          }),
        }),
      }),
    });

    // Mock the Webhook throwing a massive network error
    (global.fetch as any).mockRejectedValueOnce(new Error('Network disconnected'));

    const formData = createMockFormData();
    const result = await submitLeadAction({}, formData);

    // User still sees success
    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});