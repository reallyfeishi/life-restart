export const AI_MODELS = [
  { id: 'glm-5', name: 'GLM-5', speed: '快', family: 'glm' as const },
  { id: 'qwen3.6-plus', name: 'Qwen 3.6 Plus', speed: '中', family: 'qwen' as const },
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', speed: '中', family: 'qwen' as const },
  { id: 'glm-4.7', name: 'GLM-4.7', speed: '快', family: 'glm' as const },
  { id: 'kimi-k2.5', name: 'Kimi K2.5', speed: '中', family: 'kimi' as const },
  { id: 'MiniMax-M2.5', name: 'MiniMax M2.5', speed: '快', family: 'minimax' as const },
];

export function modelSupportsThinking(modelId: string): boolean {
  const family = AI_MODELS.find(m => m.id === modelId)?.family;
  return family === 'glm' || family === 'qwen';
}

interface AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
}

export function createAIClient(model?: string): AIConfig {
  return {
    baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.AI_API_KEY || '',
    model: model || process.env.AI_MODEL || 'gpt-4o',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.8'),
  };
}

export async function chatCompletion(
  config: AIConfig,
  messages: { role: string; content: string }[],
  maxTokens?: number,
  disableThinking?: boolean
): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: config.temperature,
    max_tokens: maxTokens || 500,
  };

  // Add thinking mode parameters for supported models
  if (disableThinking) {
    const modelFamily = AI_MODELS.find(m => m.id === config.model)?.family;
    if (modelFamily === 'qwen') {
      (body as Record<string, unknown>).enable_thinking = false;
    } else if (modelFamily === 'glm') {
      (body as Record<string, unknown>).thinking = { type: 'disabled' };
    }
  }

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
