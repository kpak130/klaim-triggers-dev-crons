export type ModelType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface BaseModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  type: ModelType;
  tags: string[];
  popularity: number;
  runCount?: number;
}

export interface TextModelFields {
  contextLength: number;
  mmlu?: number;
  gpqa?: number;
  humanEval?: number;
  sweBench?: number;
  liveCodeBench?: number;
  math?: number;
  arenaElo?: number;
  speed?: number;
  latency?: number;
}

export interface ImageModelFields {
  supportedSizes: string[];
  styles: string[];
  maxResolution?: string;
  supportsInpainting?: boolean;
  supportsOutpainting?: boolean;
  supportsControlNet?: boolean;
  qualityScore?: number;
  speedScore?: number;
}

export interface VideoModelFields {
  maxDuration: number;
  resolution: string[];
  fps?: number;
  supportsAudio?: boolean;
  supportsTextToVideo?: boolean;
  supportsImageToVideo?: boolean;
  qualityScore?: number;
  motionScore?: number;
}

export interface AudioModelFields {
  audioType: 'tts' | 'stt' | 'music';
  languages: string[];
  voiceCloning?: boolean;
  emotionControl?: boolean;
  realtime?: boolean;
  qualityScore?: number;
  naturalness?: number;
  accuracy?: number;
}

export interface TextModelPricing {
  promptPrice: number;
  completionPrice: number;
}

export interface ImageModelPricing {
  pricePerImage: number;
  pricePerSecond?: number;
}

export interface VideoModelPricing {
  pricePerSecond: number;
}

export interface AudioModelPricing {
  pricePerMinute?: number;
  pricePerChar?: number;
}

export type ModelPricing =
  | TextModelPricing
  | ImageModelPricing
  | VideoModelPricing
  | AudioModelPricing;

export interface ModelWithPrice extends BaseModel {
  price: ModelPricing;
}

export interface BenchmarkData {
  mmlu?: number;
  gpqa?: number;
  humanEval?: number;
  sweBench?: number;
  liveCodeBench?: number;
  math?: number;
  speed?: number;
  latency?: number;
  arenaElo?: number;
}