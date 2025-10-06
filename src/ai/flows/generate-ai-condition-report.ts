'use server';
/**
 * @fileOverview AI-powered condition report generator based on uploaded images.
 *
 * - generateAiConditionReport - A function that generates the condition report.
 * - GenerateAiConditionReportInput - The input type for the generateAiConditionReport function.
 * - GenerateAiConditionReportOutput - The return type for the generateAiConditionReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiConditionReportInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "An array of photos of the property, as data URIs that must include a MIME type and use Base64 encoding. Expected format: ['data:<mimetype>;base64,<encoded_data>', ...]"
    ),
});
export type GenerateAiConditionReportInput = z.infer<typeof GenerateAiConditionReportInputSchema>;

const GenerateAiConditionReportOutputSchema = z.object({
  conditionReport: z
    .string()
    .describe('The AI-generated condition report for the property.'),
});
export type GenerateAiConditionReportOutput = z.infer<typeof GenerateAiConditionReportOutputSchema>;

export async function generateAiConditionReport(
  input: GenerateAiConditionReportInput
): Promise<GenerateAiConditionReportOutput> {
  return generateAiConditionReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiConditionReportPrompt',
  input: {schema: GenerateAiConditionReportInputSchema},
  output: {schema: GenerateAiConditionReportOutputSchema},
  prompt: `You are a chartered surveyor specializing in property condition reports in the UK. Analyze the following images of a property and produce a concise condition report.

For each significant observation, describe the issue, its location (e.g., "external wall," "kitchen ceiling"), and its severity (e.g., "minor cosmetic," "requires monitoring," "urgent attention needed").

Structure your report clearly. Do not include a summary, just the list of observations.

Photos:
{{#each photoDataUris}}
- {{media url=this}}
{{/each}}`,
});

const generateAiConditionReportFlow = ai.defineFlow(
  {
    name: 'generateAiConditionReportFlow',
    inputSchema: GenerateAiConditionReportInputSchema,
    outputSchema: GenerateAiConditionReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
