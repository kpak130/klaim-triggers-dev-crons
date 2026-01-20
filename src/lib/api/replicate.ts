import type { ImageModel, VideoModel, AudioModel } from '../types/models.js';

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
  'kwaivgi': 'Kuaishou',
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

async function fetchPriceFromWebPage(owner: string, name: string, type: 'image' | 'video' | 'audio' = 'image'): Promise<number | undefined> {
  try {
    const response = await fetch(`https://replicate.com/${owner}/${name}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return undefined;

    const html = await response.text();

    if (type === 'video') {
      const perSecondJsonMatch = html.match(/"price":\s*"\$([0-9]+\.?[0-9]*)",\s*"title":\s*"per second/i);
      if (perSecondJsonMatch && perSecondJsonMatch[1]) {
        const price = parseFloat(perSecondJsonMatch[1]);
        if (price > 0.01 && price < 100) {
          return price;
        }
      }
    }

    if (type === 'audio') {
      const perSecondInlineMatch = html.match(/"price":\s*"\$([0-9]+\.?[0-9]*)\s*per\s*second"/i);
      if (perSecondInlineMatch && perSecondInlineMatch[1]) {
        const price = parseFloat(perSecondInlineMatch[1]);
        if (price > 0 && price < 100) {
          return price;
        }
      }
    }

    const perOutputJsonMatch = html.match(/"price":\s*"\$([0-9]+\.?[0-9]*)",\s*"title":\s*"per output/i);
    if (perOutputJsonMatch && perOutputJsonMatch[1]) {
      const price = parseFloat(perOutputJsonMatch[1]);
      if (price > 0.001 && price < 100) {
        return price;
      }
    }

    const outputPriceMatch = html.match(/\$([0-9]+\.?[0-9]*)\s*per\s*output/i);
    if (outputPriceMatch && outputPriceMatch[1]) {
      const price = parseFloat(outputPriceMatch[1]);
      if (price > 0.001 && price < 100) {
        return price;
      }
    }

    const p50Match = html.match(/"p50price":\s*"\$([0-9]+\.?[0-9]*)"/);
    if (p50Match && p50Match[1]) {
      const price = parseFloat(p50Match[1]);
      if (price > 0.001 && price < 100) {
        return price;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
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
      const price = await fetchPriceFromWebPage(model.owner, model.name);

      imageModels.push({
        id: modelKey,
        name: formatModelDisplayName(model.owner, model.name),
        provider: formatProviderName(model.owner),
        description: model.description || '',
        category: 'image' as const,
        pricing: {
          perImage: price,
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
      const price = await fetchPriceFromWebPage(model.owner, model.name, 'video');

      videoModels.push({
        id: modelKey,
        name: formatModelDisplayName(model.owner, model.name),
        provider: formatProviderName(model.owner),
        description: model.description || '',
        category: 'video' as const,
        pricing: {
          perSecond: price,
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

        const price = await fetchPriceFromWebPage(model.owner, model.name, 'audio');

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perSecond: price,
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

        const price = await fetchPriceFromWebPage(model.owner, model.name, 'audio');

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perSecond: price,
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
