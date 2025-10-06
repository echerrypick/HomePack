'use server';

/**
 * @fileOverview AI-powered summary of property data.
 *
 * - generateAiSummary - A function that generates an AI summary of property data.
 * - GenerateAiSummaryInput - The input type for the generateAiSummary function.
 * - GenerateAiSummaryOutput - The return type for the generateAiSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiSummaryInputSchema = z.object({
  propertyData: z.string().describe('The fetched property data as a string.'),
});
export type GenerateAiSummaryInput = z.infer<typeof GenerateAiSummaryInputSchema>;

const GenerateAiSummaryOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the property data.'),
});
export type GenerateAiSummaryOutput = z.infer<typeof GenerateAiSummaryOutputSchema>;

export async function generateAiSummary(input: GenerateAiSummaryInput): Promise<GenerateAiSummaryOutput> {
  return generateAiSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiSummaryPrompt',
  input: {schema: GenerateAiSummaryInputSchema},
  output: {schema: GenerateAiSummaryOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing property data for potential home buyers in the UK. Analyze the following property data and provide a concise summary, highlighting key features, potential issues, and relevant insights. The summary should be no more than 200 words.

Property Data:
{{{propertyData}}}`,
});

const generateAiSummaryFlow = ai.defineFlow(
  {
    name: 'generateAiSummaryFlow',
    inputSchema: GenerateAiSummaryInputSchema,
    outputSchema: GenerateAiSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
