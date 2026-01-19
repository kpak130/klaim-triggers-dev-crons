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

interface ImageModelMeta {
  perImage: number;
  perSecond?: number;
  qualityScore: number;
  speedScore: number;
  maxResolution: string;
  supportsInpainting?: boolean;
  supportsOutpainting?: boolean;
  supportsControlNet?: boolean;
}

const IMAGE_MODEL_META: Record<string, ImageModelMeta> = {
  'stability-ai/sdxl': { perImage: 0.002, perSecond: 0.00025, qualityScore: 85, speedScore: 75, maxResolution: '1024x1024', supportsInpainting: true, supportsControlNet: true },
  'stability-ai/stable-diffusion-3': { perImage: 0.035, qualityScore: 92, speedScore: 60, maxResolution: '1024x1024', supportsInpainting: true },
  'stability-ai/stable-diffusion-3.5-large': { perImage: 0.065, qualityScore: 95, speedScore: 50, maxResolution: '1024x1024', supportsInpainting: true },
  'stability-ai/stable-diffusion-3.5-large-turbo': { perImage: 0.04, qualityScore: 90, speedScore: 85, maxResolution: '1024x1024' },
  'black-forest-labs/flux-schnell': { perImage: 0.003, qualityScore: 80, speedScore: 95, maxResolution: '1024x1024' },
  'black-forest-labs/flux-dev': { perImage: 0.025, qualityScore: 88, speedScore: 70, maxResolution: '1024x1024', supportsControlNet: true },
  'black-forest-labs/flux-pro': { perImage: 0.05, qualityScore: 93, speedScore: 65, maxResolution: '1024x1024' },
  'black-forest-labs/flux-1.1-pro': { perImage: 0.04, qualityScore: 94, speedScore: 70, maxResolution: '1024x1024' },
  'bytedance/sdxl-lightning-4step': { perImage: 0.0019, qualityScore: 78, speedScore: 98, maxResolution: '1024x1024' },
  'lucataco/realvisxl-v2.0': { perImage: 0.00115, qualityScore: 82, speedScore: 80, maxResolution: '1024x1024' },
  'playgroundai/playground-v2.5-1024px-aesthetic': { perImage: 0.00115, qualityScore: 86, speedScore: 75, maxResolution: '1024x1024' },
};

interface VideoModelMeta {
  perSecond: number;
  qualityScore: number;
  motionScore: number;
  maxDuration: number;
  fps: number;
  supportsAudio?: boolean;
  supportsTextToVideo?: boolean;
  supportsImageToVideo?: boolean;
}

const VIDEO_MODEL_META: Record<string, VideoModelMeta> = {
  'minimax/video-01': { perSecond: 0.035, qualityScore: 88, motionScore: 85, maxDuration: 6, fps: 24, supportsTextToVideo: true },
  'luma/ray': { perSecond: 0.04, qualityScore: 90, motionScore: 88, maxDuration: 5, fps: 24, supportsTextToVideo: true, supportsImageToVideo: true },
  'stability-ai/stable-video-diffusion': { perSecond: 0.02, qualityScore: 80, motionScore: 75, maxDuration: 4, fps: 14, supportsImageToVideo: true },
  'tencent/hunyuan-video': { perSecond: 0.03, qualityScore: 85, motionScore: 82, maxDuration: 5, fps: 24, supportsTextToVideo: true },
  'genmo/mochi-1-preview': { perSecond: 0.025, qualityScore: 82, motionScore: 78, maxDuration: 5, fps: 24, supportsTextToVideo: true },
};

interface AudioModelMeta {
  perMinute?: number;
  perCharacter?: number;
  qualityScore: number;
  naturalness?: number;
  accuracy?: number;
  voiceCloning?: boolean;
  realtime?: boolean;
  emotionControl?: boolean;
}

const AUDIO_MODEL_META: Record<string, AudioModelMeta> = {
  'openai/whisper': { perMinute: 0.006, qualityScore: 95, accuracy: 98, realtime: false },
  'suno-ai/bark': { perCharacter: 0.015, qualityScore: 85, naturalness: 80, emotionControl: true },
  'cjwbw/seamless_communication': { perMinute: 0.008, qualityScore: 88, accuracy: 92, realtime: true },
  'lucataco/xtts-v2': { perCharacter: 0.012, qualityScore: 90, naturalness: 88, voiceCloning: true },
  'adirik/styletts2': { perCharacter: 0.01, qualityScore: 87, naturalness: 85 },
  'suno-ai/suno-v4': { perMinute: 0.02, qualityScore: 92, naturalness: 90, emotionControl: true },
};

function getImageMeta(modelKey: string): ImageModelMeta | null {
  return IMAGE_MODEL_META[modelKey] || null;
}

function getVideoMeta(modelKey: string): VideoModelMeta | null {
  return VIDEO_MODEL_META[modelKey] || null;
}

function getAudioMeta(modelKey: string): AudioModelMeta | null {
  return AUDIO_MODEL_META[modelKey] || null;
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

function estimateImagePrice(model: ReplicateModel): number {
  const modelKey = `${model.owner}/${model.name}`;
  const meta = IMAGE_MODEL_META[modelKey];
  if (meta) return meta.perImage;

  return model.run_count > 1000000 ? 0.03 :
         model.run_count > 100000 ? 0.015 :
         model.run_count > 10000 ? 0.008 : 0.004;
}

function estimateVideoPrice(model: ReplicateModel): number {
  const modelKey = `${model.owner}/${model.name}`;
  const meta = VIDEO_MODEL_META[modelKey];
  if (meta) return meta.perSecond;

  return model.run_count > 100000 ? 0.04 : 0.025;
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

function extractPriceFromBillingConfig(billingConfig: BillingConfig | undefined): number | null {
  if (!billingConfig?.current_tiers || billingConfig.current_tiers.length === 0) return null;

  const tier = billingConfig.current_tiers[0];
  if (tier.price && tier.price > 0) {
    return tier.price;
  }
  return null;
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
      const meta = getImageMeta(modelKey);

      const detail = await fetchModelDetail(apiToken, model.owner, model.name);
      const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);
      const price = apiPrice ?? estimateImagePrice(model);

      imageModels.push({
        id: modelKey,
        name: formatModelDisplayName(model.owner, model.name),
        provider: formatProviderName(model.owner),
        description: model.description || '',
        category: 'image' as const,
        pricing: {
          perImage: price,
          perSecond: meta?.perSecond,
        },
        supportedSizes: ['1024x1024', '512x512'],
        style: ['photorealistic', 'artistic'],
        tags: model.run_count > 1000000 ? ['popular'] : [],
        popularity: Math.min(100, Math.floor(model.run_count / 100000)),
        updatedAt: model.latest_version?.created_at || new Date().toISOString(),
        qualityScore: meta?.qualityScore,
        speedScore: meta?.speedScore,
        maxResolution: meta?.maxResolution || '1024x1024',
        supportsInpainting: meta?.supportsInpainting,
        supportsOutpainting: meta?.supportsOutpainting,
        supportsControlNet: meta?.supportsControlNet,
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
      const meta = getVideoMeta(modelKey);

      const detail = await fetchModelDetail(apiToken, model.owner, model.name);
      const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);
      const price = apiPrice ?? estimateVideoPrice(model);

      videoModels.push({
        id: modelKey,
        name: formatModelDisplayName(model.owner, model.name),
        provider: formatProviderName(model.owner),
        description: model.description || '',
        category: 'video' as const,
        pricing: {
          perSecond: price,
        },
        maxDuration: meta?.maxDuration || 10,
        resolution: ['720p', '1080p'],
        tags: model.run_count > 100000 ? ['popular'] : [],
        popularity: Math.min(100, Math.floor(model.run_count / 10000)),
        updatedAt: model.latest_version?.created_at || new Date().toISOString(),
        qualityScore: meta?.qualityScore,
        motionScore: meta?.motionScore,
        fps: meta?.fps || 24,
        supportsAudio: meta?.supportsAudio,
        supportsTextToVideo: meta?.supportsTextToVideo,
        supportsImageToVideo: meta?.supportsImageToVideo,
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
        const meta = getAudioMeta(id);

        const detail = await fetchModelDetail(apiToken, model.owner, model.name);
        const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perMinute: apiPrice ?? meta?.perMinute ?? 0.006,
          },
          type: 'stt',
          languages: ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de'],
          tags: model.run_count > 100000 ? ['popular'] : [],
          popularity: Math.min(100, Math.floor(model.run_count / 10000)),
          updatedAt: model.latest_version?.created_at || new Date().toISOString(),
          qualityScore: meta?.qualityScore,
          accuracy: meta?.accuracy,
          realtime: meta?.realtime,
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
        const meta = getAudioMeta(id);

        const detail = await fetchModelDetail(apiToken, model.owner, model.name);
        const apiPrice = extractPriceFromBillingConfig(detail?.billing_config);

        audioModels.push({
          id,
          name: formatModelDisplayName(model.owner, model.name),
          provider: formatProviderName(model.owner),
          description: model.description || '',
          category: 'audio' as const,
          pricing: {
            perCharacter: apiPrice ?? meta?.perCharacter ?? 0.015,
          },
          type: 'tts',
          languages: ['en'],
          tags: model.run_count > 100000 ? ['popular'] : [],
          popularity: Math.min(100, Math.floor(model.run_count / 10000)),
          updatedAt: model.latest_version?.created_at || new Date().toISOString(),
          qualityScore: meta?.qualityScore,
          naturalness: meta?.naturalness,
          voiceCloning: meta?.voiceCloning,
          emotionControl: meta?.emotionControl,
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