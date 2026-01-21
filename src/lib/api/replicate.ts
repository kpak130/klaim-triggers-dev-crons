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

interface BillingTier {
  criteria: Array<{ value?: string }>;
  prices: Array<{
    price: string;
    metric: string;
    metric_display?: string;
    title?: string;
  }>;
}

interface BillingConfig {
  current_tiers?: BillingTier[];
}

interface VideoPriceResult {
  price: number;
  type: 'perSecond' | 'perVideo';
}

interface AudioPriceResult {
  price: number;
  type: 'perSecond' | 'perOutput';
}

function parseBillingConfig(html: string): BillingConfig | null {
  const match = html.match(/"billingConfig"\s*:\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]) as BillingConfig;
  } catch {
    return null;
  }
}

function extractPriceFromBillingConfig(
  billingConfig: BillingConfig,
  type: 'image' | 'video' | 'audio'
): number | undefined {
  const tiers = billingConfig.current_tiers;
  if (!tiers || tiers.length === 0) return undefined;

  const tier = tiers[0];
  if (!tier.prices || tier.prices.length === 0) return undefined;

  const priceInfo = tier.prices[0];
  const priceStr = priceInfo.price;
  const title = priceInfo.title || '';

  const priceMatch = priceStr.match(/\$([0-9]+\.?[0-9]*)/);
  if (!priceMatch) return undefined;

  let price = parseFloat(priceMatch[1]);
  if (price <= 0 || price >= 100) return undefined;

  if (title.includes('thousand') || title.includes('1000') || title.includes('1,000')) {
    price = price / 1000;
  }

  const metric = priceInfo.metric || '';
  const metricDisplay = priceInfo.metric_display || '';

  if (type === 'image') {
    if (metric.includes('image') || metricDisplay.includes('image')) {
      return price;
    }
    return 0;
  } else if (type === 'video') {
    if (metric.includes('video') || metric.includes('second') || metricDisplay.includes('second')) {
      return price;
    }
  } else if (type === 'audio') {
    if (metric.includes('audio') || metric.includes('second') || metricDisplay.includes('second')) {
      return price;
    }
  }

  return price;
}

function extractPriceFromRegex(html: string, type: 'image' | 'video' | 'audio'): number | undefined {
  if (type === 'image') {
    return 0;
  }

  const patterns: RegExp[] = [];

  if (type === 'video') {
    patterns.push(
      /"price":\s*"\$([0-9]+\.?[0-9]*)",\s*"metric":\s*"video/,
      /\$([0-9]+\.?[0-9]*)\s*per\s*second\s*of\s*output\s*video/i,
      /"price":\s*"\$([0-9]+\.?[0-9]*)",\s*"title":\s*"per second/i,
      /\$([0-9]+\.?[0-9]*)\s*per\s*second/i
    );
  } else if (type === 'audio') {
    patterns.push(
      /"price":\s*"\$([0-9]+\.?[0-9]*)",\s*"metric":\s*"audio/,
      /"price":\s*"\$([0-9]+\.?[0-9]*)\s*per\s*second"/i,
      /\$([0-9]+\.?[0-9]*)\s*per\s*second/i
    );
  }

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const price = parseFloat(match[1]);
      if (price > 0 && price < 100) {
        return price;
      }
    }
  }

  return undefined;
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

    const billingConfig = parseBillingConfig(html);
    if (billingConfig) {
      const price = extractPriceFromBillingConfig(billingConfig, type);
      if (price !== undefined) {
        return price;
      }
    }

    if (type === 'audio') {
      return 0;
    }

    return extractPriceFromRegex(html, type);
  } catch {
    return undefined;
  }
}

async function fetchVideoPriceFromWebPage(owner: string, name: string): Promise<VideoPriceResult | undefined> {
  try {
    const response = await fetch(`https://replicate.com/${owner}/${name}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return undefined;

    const html = await response.text();

    const billingConfig = parseBillingConfig(html);
    if (!billingConfig) return { price: 0, type: 'perVideo' };

    const tiers = billingConfig.current_tiers;
    if (!tiers || tiers.length === 0) return { price: 0, type: 'perVideo' };

    const tier = tiers[0];
    if (!tier.prices || tier.prices.length === 0) return { price: 0, type: 'perVideo' };

    const priceInfo = tier.prices[0];
    const priceStr = priceInfo.price;

    const priceMatch = priceStr.match(/\$([0-9]+\.?[0-9]*)/);
    if (!priceMatch) return { price: 0, type: 'perVideo' };

    const price = parseFloat(priceMatch[1]);
    if (price <= 0 || price >= 100) return { price: 0, type: 'perVideo' };

    const metric = priceInfo.metric || '';

    if (metric.includes('duration') || metric.includes('second')) {
      return { price, type: 'perSecond' };
    }

    if (metric.includes('video') || metric.includes('count')) {
      return { price, type: 'perVideo' };
    }

    return { price, type: 'perVideo' };
  } catch {
    return undefined;
  }
}

async function fetchAudioPriceFromWebPage(owner: string, name: string): Promise<AudioPriceResult | undefined> {
  try {
    const response = await fetch(`https://replicate.com/${owner}/${name}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.log(`[AudioPrice] ${owner}/${name}: HTTP ${response.status}`);
      return undefined;
    }

    const html = await response.text();

    const billingConfig = parseBillingConfig(html);
    if (!billingConfig) {
      console.log(`[AudioPrice] ${owner}/${name}: No billingConfig (free/open-source)`);
      return { price: 0, type: 'perSecond' };
    }

    const tiers = billingConfig.current_tiers;
    if (!tiers || tiers.length === 0) {
      console.log(`[AudioPrice] ${owner}/${name}: No tiers`);
      return { price: 0, type: 'perSecond' };
    }

    const tier = tiers[0];
    if (!tier.prices || tier.prices.length === 0) {
      console.log(`[AudioPrice] ${owner}/${name}: No prices in tier`);
      return { price: 0, type: 'perSecond' };
    }

    const priceInfo = tier.prices[0];
    const priceStr = priceInfo.price;

    const priceMatch = priceStr.match(/\$([0-9]+\.?[0-9]*)/);
    if (!priceMatch) {
      console.log(`[AudioPrice] ${owner}/${name}: No price match in "${priceStr}"`);
      return { price: 0, type: 'perSecond' };
    }

    const price = parseFloat(priceMatch[1]);
    if (price <= 0 || price >= 100) {
      console.log(`[AudioPrice] ${owner}/${name}: Price out of range: ${price}`);
      return { price: 0, type: 'perSecond' };
    }

    const metric = priceInfo.metric || '';
    console.log(`[AudioPrice] ${owner}/${name}: price=$${price}, metric="${metric}"`);

    if (metric.includes('output_count') || metric.includes('output')) {
      return { price, type: 'perOutput' };
    }

    return { price, type: 'perSecond' };
  } catch (err) {
    console.log(`[AudioPrice] ${owner}/${name}: Error - ${err}`);
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
      const priceResult = await fetchVideoPriceFromWebPage(model.owner, model.name);

      videoModels.push({
        id: modelKey,
        name: formatModelDisplayName(model.owner, model.name),
        provider: formatProviderName(model.owner),
        description: model.description || '',
        category: 'video' as const,
        pricing: {
          perSecond: priceResult?.type === 'perSecond' ? priceResult.price : undefined,
          perVideo: priceResult?.type === 'perVideo' ? priceResult.price : undefined,
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

        const priceResult = await fetchAudioPriceFromWebPage(model.owner, model.name);

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perSecond: priceResult?.type === 'perSecond' ? priceResult.price : undefined,
            perOutput: priceResult?.type === 'perOutput' ? priceResult.price : undefined,
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

        const priceResult = await fetchAudioPriceFromWebPage(model.owner, model.name);

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perSecond: priceResult?.type === 'perSecond' ? priceResult.price : undefined,
            perOutput: priceResult?.type === 'perOutput' ? priceResult.price : undefined,
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
