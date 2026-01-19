import type { ImageModel, VideoModel, AudioModel } from '../types/models.js';

interface BillingTier {
  price: number;
  unit: string;
  criteria?: Record<string, unknown>;
}

interface BillingConfig {
  billing_type?: string;
  metric?: string;
  current_tiers?: BillingTier[];
}

interface ReplicateModel {
  url: string;
  owner: string;
  name: string;
  description: string;
  visibility: string;
  run_count: number;
  cover_image_url?: string;
  default_example?: {
    model: string;
    version: string;
  };
  latest_version?: {
    id: string;
    created_at: string;
    openapi_schema?: {
      components?: {
        schemas?: {
          Input?: {
            properties?: Record<string, unknown>;
          };
        };
      };
    };
  };
}

interface ReplicateModelDetail extends ReplicateModel {
  billing_config?: BillingConfig;
}

interface ReplicateCollectionResponse {
  models: ReplicateModel[];
}

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  'stability-ai': 'Stability AI',
  'black-forest-labs': 'Black Forest Labs',
  'bytedance': 'ByteDance',
  'lucataco': 'Lucataco',
  'playgroundai': 'Playground AI',
  'minimax': 'MiniMax',
  'luma': 'Luma',
  'tencent': 'Tencent',
  'genmo': 'Genmo',
  'openai': 'OpenAI',
  'suno-ai': 'Suno AI',
  'cjwbw': 'CJWBW',
  'adirik': 'Adirik',
  'meta': 'Meta',
  'google': 'Google',
  'ideogram': 'Ideogram',
  'recraft-ai': 'Recraft AI',
  'fofr': 'Fofr',
  'zsxkib': 'Zsxkib',
  'mcai': 'MCAI',
  'chenxwh': 'Chenxwh',
  'nvidia': 'NVIDIA',
  'facebookresearch': 'Facebook Research',
  'cerspense': 'Cerspense',
  'cuuupid': 'Cuuupid',
  'daanelson': 'Daanelson',
  'lightricks': 'Lightricks',
  'alibaba': 'Alibaba',
  'rhymes-ai': 'Rhymes AI',
};

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatProviderName(owner: string): string {
  return PROVIDER_DISPLAY_NAMES[owner] || formatSlugToTitle(owner);
}

function formatModelDisplayName(owner: string, modelName: string): string {
  const providerDisplay = formatProviderName(owner);
  const modelDisplay = formatSlugToTitle(modelName);
  return `${providerDisplay}: ${modelDisplay}`;
}

async function fetchModelDetail(apiToken: string, owner: string, name: string): Promise<ReplicateModelDetail | null> {
  try {
    const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}`, {
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as ReplicateModelDetail;
  } catch {
    return null;
  }
}

function extractPriceFromBillingConfig(billingConfig: BillingConfig | undefined): number | undefined {
  if (!billingConfig?.current_tiers || billingConfig.current_tiers.length === 0) return undefined;

  const tier = billingConfig.current_tiers[0];
  if (tier.price && tier.price > 0) {
    return tier.price;
  }
  return undefined;
}

export async function fetchReplicateImageModels(apiToken: string): Promise<ImageModel[]> {
  try {
    const response = await fetch('https://api.replicate.com/v1/collections/text-to-image', {
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const data = (await response.json()) as ReplicateCollectionResponse;

    const seen = new Set<string>();
    const uniqueModels = data.models.filter((model) => {
      const id = `${model.owner}/${model.name}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const imageModels: ImageModel[] = [];

    for (const model of uniqueModels) {
      const modelKey = `${model.owner}/${model.name}`;

      const detail = await fetchModelDetail(apiToken, model.owner, model.name);
      const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);

      imageModels.push({
        id: modelKey,
        name: formatModelDisplayName(model.owner, model.name),
        provider: formatProviderName(model.owner),
        description: model.description || '',
        category: 'image' as const,
        pricing: {
          perImage: apiPrice,
        },
        supportedSizes: ['1024x1024', '512x512'],
        style: ['photorealistic', 'artistic'],
        tags: model.run_count > 1000000 ? ['popular'] : [],
        popularity: Math.min(100, Math.floor(model.run_count / 100000)),
        updatedAt: model.latest_version?.created_at || new Date().toISOString(),
        runCount: model.run_count,
      });
    }

    return imageModels;
  } catch (error) {
    console.error('Failed to fetch Replicate image models:', error);
    return [];
  }
}

export async function fetchReplicateVideoModels(apiToken: string): Promise<VideoModel[]> {
  try {
    const response = await fetch('https://api.replicate.com/v1/collections/text-to-video', {
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const data = (await response.json()) as ReplicateCollectionResponse;

    const seen = new Set<string>();
    const uniqueModels = data.models.filter((model) => {
      const id = `${model.owner}/${model.name}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const videoModels: VideoModel[] = [];

    for (const model of uniqueModels) {
      const modelKey = `${model.owner}/${model.name}`;

      const detail = await fetchModelDetail(apiToken, model.owner, model.name);
      const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);

      videoModels.push({
        id: modelKey,
        name: formatModelDisplayName(model.owner, model.name),
        provider: formatProviderName(model.owner),
        description: model.description || '',
        category: 'video' as const,
        pricing: {
          perSecond: apiPrice,
        },
        maxDuration: 10,
        resolution: ['720p', '1080p'],
        tags: model.run_count > 100000 ? ['popular'] : [],
        popularity: Math.min(100, Math.floor(model.run_count / 10000)),
        updatedAt: model.latest_version?.created_at || new Date().toISOString(),
        runCount: model.run_count,
      });
    }

    return videoModels;
  } catch (error) {
    console.error('Failed to fetch Replicate video models:', error);
    return [];
  }
}

export async function fetchReplicateAudioModels(apiToken: string): Promise<AudioModel[]> {
  try {
    const [sttResponse, ttsResponse] = await Promise.all([
      fetch('https://api.replicate.com/v1/collections/speech-recognition', {
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch('https://api.replicate.com/v1/collections/text-to-speech', {
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }),
    ]);

    const audioModels: AudioModel[] = [];
    const seen = new Set<string>();

    if (sttResponse.ok) {
      const sttData = (await sttResponse.json()) as ReplicateCollectionResponse;
      for (const model of sttData.models) {
        const id = `${model.owner}/${model.name}`;
        if (seen.has(id)) continue;
        seen.add(id);

        const detail = await fetchModelDetail(apiToken, model.owner, model.name);
        const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perMinute: apiPrice,
          },
          type: 'stt',
          languages: ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de'],
          tags: model.run_count > 100000 ? ['popular'] : [],
          popularity: Math.min(100, Math.floor(model.run_count / 10000)),
          updatedAt: model.latest_version?.created_at || new Date().toISOString(),
          runCount: model.run_count,
        });
      }
    }

    if (ttsResponse.ok) {
      const ttsData = (await ttsResponse.json()) as ReplicateCollectionResponse;
      for (const model of ttsData.models) {
        const id = `${model.owner}/${model.name}`;
        if (seen.has(id)) continue;
        seen.add(id);

        const detail = await fetchModelDetail(apiToken, model.owner, model.name);
        const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perCharacter: apiPrice,
          },
          type: 'tts',
          languages: ['en'],
          tags: model.run_count > 100000 ? ['popular'] : [],
          popularity: Math.min(100, Math.floor(model.run_count / 10000)),
          updatedAt: model.latest_version?.created_at || new Date().toISOString(),
          runCount: model.run_count,
        });
      }
    }

    return audioModels;
  } catch (error) {
    console.error('Failed to fetch Replicate audio models:', error);
    return [];
  }
}
