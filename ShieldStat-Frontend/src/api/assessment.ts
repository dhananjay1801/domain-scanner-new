import { apiFetch } from './config';

export interface AssessmentResponse {
  success: boolean;
  resultId: string;
  data: {
    summary: { grade: string; score: number };
    answers: any[];
  };
}

/**
 * Submits the user's answers to the assessment questionnaire.
 */
export async function submitAssessment(answers: any[]): Promise<AssessmentResponse> {
  return apiFetch<AssessmentResponse>('/assess/', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

/**
 * Retrieves the latest assessment result.
 */
export async function getLatestAssessment(): Promise<any> {
  return apiFetch<any>('/assess/latest', {
    method: 'GET',
  });
}

/**
 * Retrieves the questionnaire options.
 */
export async function getQuestions(): Promise<any[]> {
  return apiFetch<any[]>('/questions/', {
    method: 'GET',
    requiresAuth: false,
  });
}

/**
 * Retrieves the history of assessment results.
 */
export async function getAssessmentHistory(limit: number = 10): Promise<any[]> {
  return apiFetch<any[]>(`/assess/history?limit=${limit}`, {
    method: 'GET',
  });
}
