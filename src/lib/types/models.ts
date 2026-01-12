export interface BaseModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'text' | 'image' | 'video' | 'audio';
  tags: string[];
  popularity: number;
  updatedAt: string;
}

export interface TextModel extends BaseModel {
  category: 'text';
  pricing: {
    prompt: number;
    completion: number;
  };
  contextLength: number;
  capabilities: string[];
}

export interface ImageModel extends BaseModel {
  category: 'image';
  pricing: {
    perImage: number;
    perSecond?: number;
  };
  supportedSizes: string[];
  style: string[];
  qualityScore?: number;
  speedScore?: number;
  maxResolution?: string;
  supportsInpainting?: boolean;
  supportsOutpainting?: boolean;
  supportsControlNet?: boolean;
  runCount?: number;
}

export interface VideoModel extends BaseModel {
  category: 'video';
  pricing: {
    perSecond: number;
  };
  maxDuration: number;
  resolution: string[];
  qualityScore?: number;
  motionScore?: number;
  fps?: number;
  supportsAudio?: boolean;
  supportsTextToVideo?: boolean;
  supportsImageToVideo?: boolean;
  runCount?: number;
}

export interface AudioModel extends BaseModel {
  category: 'audio';
  pricing: {
    perMinute?: number;
    perCharacter?: number;
  };
  type: 'tts' | 'stt' | 'music';
  languages: string[];
  qualityScore?: number;
  naturalness?: number;
  accuracy?: number;
  voiceCloning?: boolean;
  realtime?: boolean;
  emotionControl?: boolean;
  runCount?: number;
}

export type AIModel = TextModel | ImageModel | VideoModel | AudioModel;

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