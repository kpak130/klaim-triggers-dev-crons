import type { BenchmarkData } from '../types/models.js';

export function getCodingScore(benchmark: BenchmarkData | undefined | null): number | undefined {
  if (!benchmark) return undefined;
  const scores = [benchmark.humanEval, benchmark.sweBench, benchmark.liveCodeBench].filter(s => s !== undefined) as number[];
  if (scores.length === 0) return undefined;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
}

export const benchmarks: Record<string, BenchmarkData> = {
  'openai/gpt-4o': { mmlu: 88.7, gpqa: 53.6, humanEval: 90.2, sweBench: 38.4, liveCodeBench: 43.5, math: 76.6, speed: 109, latency: 320, arenaElo: 1285 },
  'openai/gpt-4o-mini': { mmlu: 82.0, gpqa: 46.0, humanEval: 87.0, sweBench: 28.3, liveCodeBench: 35.2, speed: 141, latency: 280, arenaElo: 1273 },
  'openai/gpt-4-turbo': { mmlu: 86.4, gpqa: 49.1, humanEval: 87.1, sweBench: 23.0, speed: 42, latency: 450, arenaElo: 1256 },
  'openai/gpt-5.1': { mmlu: 92.0, gpqa: 85.0, humanEval: 93.0, sweBench: 55.0, liveCodeBench: 58.0, speed: 95, latency: 350, arenaElo: 1350 },
  'openai/gpt-5.2': { mmlu: 93.0, gpqa: 93.2, humanEval: 95.0, sweBench: 62.0, liveCodeBench: 65.0, speed: 85, latency: 380, arenaElo: 1380 },
  'openai/o1': { mmlu: 91.8, gpqa: 78.0, humanEval: 92.4, sweBench: 48.9, math: 94.8, speed: 35, latency: 2500, arenaElo: 1350 },
  'openai/o1-mini': { mmlu: 85.2, gpqa: 60.0, humanEval: 88.0, sweBench: 40.2, math: 90.0, speed: 65, latency: 1200, arenaElo: 1304 },
  'openai/o1-preview': { mmlu: 90.8, gpqa: 73.3, humanEval: 91.0, sweBench: 41.3, math: 85.5, speed: 28, latency: 3500, arenaElo: 1335 },
  'openai/o3-mini': { gpqa: 79.7, humanEval: 92.6, sweBench: 49.3, math: 97.0, speed: 150, latency: 800, arenaElo: 1330 },
  'anthropic/claude-3.5-sonnet': { mmlu: 90.4, gpqa: 59.4, humanEval: 92.0, sweBench: 49.0, liveCodeBench: 45.2, math: 71.1, speed: 79, latency: 410, arenaElo: 1268 },
  'anthropic/claude-3.5-sonnet:beta': { mmlu: 90.4, gpqa: 59.4, humanEval: 92.0, sweBench: 49.0, liveCodeBench: 45.2, math: 71.1, speed: 79, latency: 410, arenaElo: 1268 },
  'anthropic/claude-3.5-haiku': { mmlu: 84.0, gpqa: 51.0, humanEval: 88.0, sweBench: 35.0, liveCodeBench: 38.5, speed: 145, latency: 280, arenaElo: 1230 },
  'anthropic/claude-3-opus': { mmlu: 86.8, gpqa: 50.4, humanEval: 84.9, sweBench: 22.8, math: 60.1, speed: 24, latency: 680, arenaElo: 1248 },
  'anthropic/claude-3-sonnet': { mmlu: 79.0, gpqa: 40.0, humanEval: 73.0, sweBench: 18.5, speed: 62, latency: 450, arenaElo: 1201 },
  'anthropic/claude-3-haiku': { mmlu: 75.2, gpqa: 33.0, humanEval: 75.9, sweBench: 12.0, speed: 152, latency: 220, arenaElo: 1179 },
  'anthropic/claude-opus-4.5': { mmlu: 91.0, gpqa: 83.4, humanEval: 88.5, sweBench: 72.1, liveCodeBench: 55.0, speed: 20, latency: 750, arenaElo: 1380 },
  'anthropic/claude-sonnet-4': { mmlu: 89.0, gpqa: 75.0, humanEval: 90.5, sweBench: 72.7, liveCodeBench: 58.0, speed: 75, latency: 420, arenaElo: 1320 },
  'anthropic/claude-haiku-4.5': { mmlu: 85.0, gpqa: 55.0, humanEval: 82.0, sweBench: 45.0, liveCodeBench: 42.0, speed: 160, latency: 200, arenaElo: 1260 },
  'google/gemini-pro-1.5': { mmlu: 85.9, gpqa: 46.2, humanEval: 71.9, sweBench: 28.5, speed: 68, latency: 520, arenaElo: 1260 },
  'google/gemini-flash-1.5': { mmlu: 78.9, gpqa: 39.0, humanEval: 74.3, sweBench: 25.0, speed: 247, latency: 180, arenaElo: 1227 },
  'google/gemini-2.0-flash-exp': { mmlu: 85.0, gpqa: 62.0, humanEval: 85.0, sweBench: 42.0, liveCodeBench: 45.0, speed: 320, latency: 150, arenaElo: 1290 },
  'google/gemini-2.5-pro-preview': { mmlu: 90.0, gpqa: 86.4, humanEval: 90.0, sweBench: 63.8, liveCodeBench: 60.0, speed: 85, latency: 380, arenaElo: 1355 },
  'google/gemini-3-pro-preview': { mmlu: 91.7, gpqa: 92.6, humanEval: 92.0, sweBench: 68.0, liveCodeBench: 65.0, speed: 75, latency: 400, arenaElo: 1385 },
  'google/gemini-3-flash-preview': { mmlu: 88.0, gpqa: 78.0, humanEval: 88.0, sweBench: 55.0, liveCodeBench: 52.0, speed: 280, latency: 160, arenaElo: 1310 },
  'meta-llama/llama-3.1-405b-instruct': { mmlu: 88.6, gpqa: 50.7, humanEval: 89.0, sweBench: 33.2, math: 73.8, speed: 32, latency: 580, arenaElo: 1251 },
  'meta-llama/llama-3.1-70b-instruct': { mmlu: 86.0, gpqa: 46.7, humanEval: 80.5, sweBench: 26.0, math: 68.0, speed: 85, latency: 320, arenaElo: 1227 },
  'meta-llama/llama-3.1-8b-instruct': { mmlu: 69.4, gpqa: 32.8, humanEval: 72.6, sweBench: 15.0, math: 51.9, speed: 195, latency: 180, arenaElo: 1152 },
  'meta-llama/llama-3.2-90b-vision-instruct': { mmlu: 86.0, gpqa: 46.0, humanEval: 75.0, sweBench: 24.0, speed: 55, latency: 420, arenaElo: 1235 },
  'meta-llama/llama-3.2-11b-vision-instruct': { mmlu: 73.0, gpqa: 35.0, humanEval: 72.0, sweBench: 12.0, speed: 145, latency: 220, arenaElo: 1185 },
  'meta-llama/llama-3.2-3b-instruct': { mmlu: 63.4, gpqa: 28.0, humanEval: 61.6, sweBench: 8.0, speed: 285, latency: 120, arenaElo: 1108 },
  'meta-llama/llama-3.2-1b-instruct': { mmlu: 49.3, gpqa: 22.0, humanEval: 44.0, sweBench: 3.0, speed: 380, latency: 90, arenaElo: 1052 },
  'meta-llama/llama-3.3-70b-instruct': { mmlu: 86.3, gpqa: 49.0, humanEval: 88.4, sweBench: 32.5, math: 77.0, speed: 90, latency: 300, arenaElo: 1256 },
  'mistralai/mistral-large': { mmlu: 84.0, gpqa: 45.0, humanEval: 82.0, sweBench: 28.0, speed: 55, latency: 380, arenaElo: 1235 },
  'mistralai/mistral-large-2411': { mmlu: 84.0, gpqa: 45.0, humanEval: 85.0, sweBench: 32.0, speed: 60, latency: 350, arenaElo: 1248 },
  'mistralai/mistral-medium': { mmlu: 75.3, gpqa: 38.0, humanEval: 62.0, speed: 75, latency: 300, arenaElo: 1180 },
  'mistralai/mistral-small': { mmlu: 70.6, gpqa: 32.0, humanEval: 68.0, speed: 120, latency: 200, arenaElo: 1145 },
  'mistralai/mixtral-8x7b-instruct': { mmlu: 70.6, gpqa: 34.0, humanEval: 74.0, speed: 95, latency: 250, arenaElo: 1165 },
  'mistralai/mixtral-8x22b-instruct': { mmlu: 77.8, gpqa: 40.0, humanEval: 78.0, speed: 45, latency: 420, arenaElo: 1195 },
  'mistralai/codestral-latest': { humanEval: 83.0, sweBench: 35.0, speed: 85, latency: 280 },
  'deepseek/deepseek-chat': { mmlu: 87.5, gpqa: 58.5, humanEval: 90.0, sweBench: 42.0, math: 84.6, speed: 65, latency: 350, arenaElo: 1275 },
  'deepseek/deepseek-coder': { humanEval: 90.2, sweBench: 45.0, math: 75.0, speed: 75, latency: 300, arenaElo: 1245 },
  'deepseek/deepseek-r1': { mmlu: 90.8, gpqa: 71.5, humanEval: 92.0, sweBench: 49.2, liveCodeBench: 55.0, math: 97.3, speed: 25, latency: 2000, arenaElo: 1365 },
  'deepseek/deepseek-v3': { mmlu: 88.5, gpqa: 59.1, humanEval: 82.6, sweBench: 42.0, math: 90.2, speed: 70, latency: 380, arenaElo: 1290 },
  'deepseek/deepseek-v3.2': { mmlu: 89.0, gpqa: 65.0, humanEval: 88.0, sweBench: 48.0, liveCodeBench: 50.0, math: 92.0, speed: 75, latency: 360, arenaElo: 1310 },
  'qwen/qwen-2.5-72b-instruct': { mmlu: 85.3, gpqa: 49.0, humanEval: 86.0, sweBench: 30.0, math: 83.1, speed: 45, latency: 400, arenaElo: 1245 },
  'qwen/qwen-2.5-32b-instruct': { mmlu: 83.0, gpqa: 45.0, humanEval: 83.0, sweBench: 25.0, speed: 80, latency: 280, arenaElo: 1215 },
  'qwen/qwen-2.5-7b-instruct': { mmlu: 74.2, gpqa: 35.0, humanEval: 75.0, sweBench: 15.0, speed: 180, latency: 150, arenaElo: 1145 },
  'qwen/qwen-2.5-coder-32b-instruct': { humanEval: 92.7, sweBench: 50.0, liveCodeBench: 52.0, math: 83.0, speed: 85, latency: 260, arenaElo: 1268 },
  'qwen/qwq-32b-preview': { mmlu: 85.0, gpqa: 54.5, math: 90.6, speed: 35, latency: 1500, arenaElo: 1295 },
  'cohere/command-r-plus': { mmlu: 75.7, gpqa: 38.0, humanEval: 72.0, sweBench: 18.0, speed: 55, latency: 380, arenaElo: 1185 },
  'cohere/command-r': { mmlu: 68.2, gpqa: 32.0, humanEval: 65.0, sweBench: 12.0, speed: 90, latency: 250, arenaElo: 1145 },
  'x-ai/grok-2': { mmlu: 87.5, gpqa: 56.0, humanEval: 88.0, sweBench: 35.0, speed: 70, latency: 350, arenaElo: 1280 },
  'x-ai/grok-2-mini': { mmlu: 80.0, gpqa: 48.0, humanEval: 80.0, sweBench: 25.0, speed: 120, latency: 220, arenaElo: 1225 },
  'x-ai/grok-beta': { mmlu: 85.0, gpqa: 50.0, humanEval: 85.0, sweBench: 30.0, speed: 65, latency: 380, arenaElo: 1255 },
};

export function getBenchmark(modelId: string): BenchmarkData | null {
  if (benchmarks[modelId]) {
    return benchmarks[modelId] ?? null;
  }

  const baseId = modelId.split(':')[0];
  for (const key of Object.keys(benchmarks)) {
    if (baseId?.startsWith(key) || key.startsWith(baseId ?? '')) {
      return benchmarks[key] ?? null;
    }
  }

  return null;
}