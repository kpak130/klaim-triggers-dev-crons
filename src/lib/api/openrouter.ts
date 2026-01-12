import type { TextModel } from '../types/models.js';

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  context_length?: number;
  top_provider?: {
    max_completion_tokens?: number;
  };
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

export async function fetchOpenRouterModels(): Promise<TextModel[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = (await response.json()) as OpenRouterResponse;

    return data.data
      .filter((model: OpenRouterModel) => {
        const promptPrice = parseFloat(model.pricing?.prompt || '0');
        const completionPrice = parseFloat(model.pricing?.completion || '0');
        return promptPrice > 0 || completionPrice > 0;
      })
      .map((model: OpenRouterModel): TextModel => ({
        id: model.id,
        name: model.name || model.id.split('/').pop() || model.id,
        provider: model.id.split('/')[0] || 'unknown',
        description: model.description || '',
        category: 'text' as const,
        pricing: {
          prompt: parseFloat(model.pricing?.prompt || '0') * 1000000,
          completion: parseFloat(model.pricing?.completion || '0') * 1000000,
        },
        contextLength: model.context_length || 0,
        tags: [],
        popularity: 0,
        updatedAt: new Date().toISOString(),
        capabilities: [],
      }))
      .sort((a: TextModel, b: TextModel) => {
        const aPrice = a.pricing.prompt + a.pricing.completion;
        const bPrice = b.pricing.prompt + b.pricing.completion;
        return aPrice - bPrice;
      });
  } catch (error) {
    console.error('Failed to fetch OpenRouter models:', error);
    return [];
  }
}