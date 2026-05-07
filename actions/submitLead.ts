'use server'

import { supabaseAdmin } from '@/lib/supabase';

export type FormState = {
  success?: boolean;
  error?: string;
};

export async function submitLeadAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const full_name = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const company = formData.get('company') as string;
  const source = formData.get('source') as string;
  const message = formData.get('message') as string;

  if (!full_name || !email || !source) {
    return { error: 'Please fill out all required fields.' };
  }

  const { data: lead, error: dbError } = await supabaseAdmin
    .from('leads')
    .insert([{ full_name, email, company, source, message }])
    .select()
    .single();

  if (dbError) {
    console.error('Supabase Insert Error:', dbError);
    if (dbError.code === '23505') {
      return { error: 'This email has already been submitted.' };
    }
    return { error: 'Failed to save lead. Please try again later.' };
  }

  try {
    const webhookResponse = await fetch('https://webhook-receiver-flax.vercel.app/api/lead-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Candidate-Name': 'Zachary Bernales',
      },
      body: JSON.stringify(lead),
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook failed with status: ${webhookResponse.status}`);
    }
  } catch (webhookError) {
    console.error('Webhook network or execution error:', webhookError);
  }

  return { success: true };
}