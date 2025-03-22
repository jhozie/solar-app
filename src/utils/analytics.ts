type StepEvent = {
  step: number;
  stepName: string;
  powerBand?: string;
  generatorKVA?: number;
  completed: boolean;
};

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('calculator_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('calculator_session_id', sessionId);
  }
  return sessionId;
};

export const trackStepView = async (event: StepEvent) => {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
      }),
    });
  } catch (error) {
    console.error('Failed to track step:', error);
  }
}; 