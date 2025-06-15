import { config } from 'dotenv';
config();

import '@/ai/flows/memory-context-flow.ts';
import '@/ai/flows/summarize-workout-flow.ts';
import '@/ai/flows/personalize-training-plan-flow.ts';
import '@/ai/flows/recommendations-reminders-flow.ts';