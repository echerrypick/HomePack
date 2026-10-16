import type { Express } from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';

export const CONTACT_CATEGORIES = [
  'Report support',
  'Billing and payments',
  'Account access',
  'Business plans',
  'Data correction',
  'Privacy request',
  'Other',
] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  category: z.enum(CONTACT_CATEGORIES),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(4000),
  reference: z.string().trim().max(200).optional().default(''),
  website: z.string().max(200).optional().default(''),
});

export type ContactSubmission = z.infer<typeof contactSchema>;

export function validateContactSubmission(input: unknown) {
  return contactSchema.safeParse(input);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function plainText(submission: ContactSubmission) {
  return [
    `Category: ${submission.category}`,
    `Title: ${submission.title}`,
    `Name: ${submission.name}`,
    `Reply email: ${submission.email}`,
    submission.reference ? `Reference: ${submission.reference}` : '',
    '',
    submission.description,
  ].filter((line, index) => line || index >= 5).join('\n');
}

function htmlText(submission: ContactSubmission) {
  const field = (label: string, value: string) => value ? `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>` : '';
  return [
    field('Category', submission.category),
    field('Title', submission.title),
    field('Name', submission.name),
    field('Reply email', submission.email),
    field('Reference', submission.reference),
    `<hr><p style="white-space:pre-wrap">${escapeHtml(submission.description)}</p>`,
  ].join('');
}

type RateRecord = { count: number; resetAt: number };

export function registerContactRoute(app: Express) {
  const rateLimits = new Map<string, RateRecord>();

  app.post('/api/contact', async (req, res) => {
    const contentLength = Number(req.get('content-length') || 0);
    if (Number.isFinite(contentLength) && contentLength > 12_000) {
      return res.status(413).json({ error: 'The enquiry is too large to send.' });
    }
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const existing = rateLimits.get(key);
    const current = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + 15 * 60 * 1000 }
      : existing;

    if (current.count >= 5) {
      return res.status(429).json({ error: 'Too many enquiries have been submitted. Please wait and try again.' });
    }
    current.count += 1;
    rateLimits.set(key, current);

    const result = validateContactSubmission(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Please check the form and complete all required fields.' });
    }

    // A hidden field that normal visitors never fill in. Return success to avoid
    // teaching automated spam tools how they were detected.
    if (result.data.website) return res.status(200).json({ ok: true });

    const recipient = process.env.CONTACT_TO_EMAIL?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    if (!recipient || !smtpUser || !smtpPass) {
      console.error('[CONTACT] Email delivery is not configured. CONTACT_TO_EMAIL, SMTP_USER and SMTP_PASS are required.');
      return res.status(503).json({ error: 'The contact form is temporarily unavailable. Please try again later.' });
    }

    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
      port: Number.isFinite(smtpPort) ? smtpPort : 465,
      secure: String(process.env.SMTP_SECURE ?? (smtpPort === 465)).toLowerCase() === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      await transporter.sendMail({
        from: process.env.CONTACT_FROM_EMAIL?.trim() || `UKHomePack contact form <${smtpUser}>`,
        to: recipient,
        replyTo: { name: result.data.name.replace(/[\r\n]+/g, ' '), address: result.data.email },
        subject: `[UKHomePack · ${result.data.category}] ${result.data.title.replace(/[\r\n]+/g, ' ')}`,
        text: plainText(result.data),
        html: htmlText(result.data),
      });
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('[CONTACT] Email delivery failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(502).json({ error: 'Your enquiry could not be sent. Please try again shortly.' });
    }
  });
}
