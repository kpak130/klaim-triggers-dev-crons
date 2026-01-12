import { schedules } from "@trigger.dev/sdk/v3";
import { prisma } from "../lib/db.js";
import { fetchOpenRouterModels } from "../lib/api/openrouter.js";
import {
  fetchReplicateImageModels,
  fetchReplicateVideoModels,
  fetchReplicateAudioModels,
} from "../lib/api/replicate.js";
import { getBenchmark } from "../lib/data/benchmarks.js";
import type { TextModel, ImageModel, VideoModel, AudioModel } from "../lib/types/models.js";

export const syncAIModels = schedules.task({
  id: "sync-ai-models",
  cron: "0 0 * * *",
  run: async () => {
    const startTime = Date.now();
    console.log("Starting AI models sync...");

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      console.error("REPLICATE_API_TOKEN not configured");
      await prisma.syncLog.create({
        data: {
          syncType: "full",
          status: "failed",
          errorMessage: "REPLICATE_API_TOKEN not configured",
          duration: Date.now() - startTime,
        },
      });
      return { success: false, error: "REPLICATE_API_TOKEN not configured" };
    }

    try {
      console.log("Fetching models from APIs...");
      const [textModels, imageModels, videoModels, audioModels] = await Promise.all([
        fetchOpenRouterModels(),
        fetchReplicateImageModels(replicateToken),
        fetchReplicateVideoModels(replicateToken),
        fetchReplicateAudioModels(replicateToken),
      ]);

      console.log(`Fetched: ${textModels.length} text, ${imageModels.length} image, ${videoModels.length} video, ${audioModels.length} audio models`);

      console.log("Saving text models...");
      await saveTextModels(textModels);

      console.log("Saving image models...");
      await saveImageModels(imageModels);

      console.log("Saving video models...");
      await saveVideoModels(videoModels);

      console.log("Saving audio models...");
      await saveAudioModels(audioModels);

      const duration = Date.now() - startTime;
      await prisma.syncLog.create({
        data: {
          syncType: "full",
          status: "success",
          textModelCount: textModels.length,
          imageModelCount: imageModels.length,
          videoModelCount: videoModels.length,
          audioModelCount: audioModels.length,
          duration,
        },
      });

      console.log(`Sync completed in ${duration}ms`);

      return {
        success: true,
        counts: {
          text: textModels.length,
          image: imageModels.length,
          video: videoModels.length,
          audio: audioModels.length,
        },
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await prisma.syncLog.create({
        data: {
          syncType: "full",
          status: "failed",
          errorMessage,
          duration,
        },
      });

      console.error("Sync failed:", errorMessage);
      throw error;
    }
  },
});

async function saveTextModels(models: TextModel[]) {
  for (const model of models) {
    const benchmark = getBenchmark(model.id);

    await prisma.textModel.upsert({
      where: { modelId: model.id },
      update: {
        name: model.name,
        provider: model.provider,
        description: model.description,
        promptPrice: model.pricing.prompt,
        completionPrice: model.pricing.completion,
        contextLength: model.contextLength,
        tags: model.tags,
        popularity: model.popularity,
        mmlu: benchmark?.mmlu,
        gpqa: benchmark?.gpqa,
        humanEval: benchmark?.humanEval,
        sweBench: benchmark?.sweBench,
        liveCodeBench: benchmark?.liveCodeBench,
        math: benchmark?.math,
        speed: benchmark?.speed,
        latency: benchmark?.latency,
        arenaElo: benchmark?.arenaElo,
      },
      create: {
        modelId: model.id,
        name: model.name,
        provider: model.provider,
        description: model.description,
        promptPrice: model.pricing.prompt,
        completionPrice: model.pricing.completion,
        contextLength: model.contextLength,
        tags: model.tags,
        popularity: model.popularity,
        mmlu: benchmark?.mmlu,
        gpqa: benchmark?.gpqa,
        humanEval: benchmark?.humanEval,
        sweBench: benchmark?.sweBench,
        liveCodeBench: benchmark?.liveCodeBench,
        math: benchmark?.math,
        speed: benchmark?.speed,
        latency: benchmark?.latency,
        arenaElo: benchmark?.arenaElo,
      },
    });
  }
}

async function saveImageModels(models: ImageModel[]) {
  for (const model of models) {
    await prisma.imageModel.upsert({
      where: { modelId: model.id },
      update: {
        name: model.name,
        provider: model.provider,
        description: model.description,
        pricePerImage: model.pricing.perImage,
        pricePerSecond: model.pricing.perSecond,
        supportedSizes: model.supportedSizes,
        styles: model.style,
        qualityScore: model.qualityScore,
        speedScore: model.speedScore,
        maxResolution: model.maxResolution,
        supportsInpainting: model.supportsInpainting ?? false,
        supportsOutpainting: model.supportsOutpainting ?? false,
        supportsControlNet: model.supportsControlNet ?? false,
        runCount: model.runCount,
        tags: model.tags,
        popularity: model.popularity,
      },
      create: {
        modelId: model.id,
        name: model.name,
        provider: model.provider,
        description: model.description,
        pricePerImage: model.pricing.perImage,
        pricePerSecond: model.pricing.perSecond,
        supportedSizes: model.supportedSizes,
        styles: model.style,
        qualityScore: model.qualityScore,
        speedScore: model.speedScore,
        maxResolution: model.maxResolution,
        supportsInpainting: model.supportsInpainting ?? false,
        supportsOutpainting: model.supportsOutpainting ?? false,
        supportsControlNet: model.supportsControlNet ?? false,
        runCount: model.runCount,
        tags: model.tags,
        popularity: model.popularity,
      },
    });
  }
}

async function saveVideoModels(models: VideoModel[]) {
  for (const model of models) {
    await prisma.videoModel.upsert({
      where: { modelId: model.id },
      update: {
        name: model.name,
        provider: model.provider,
        description: model.description,
        pricePerSecond: model.pricing.perSecond,
        maxDuration: model.maxDuration,
        resolution: model.resolution,
        qualityScore: model.qualityScore,
        motionScore: model.motionScore,
        fps: model.fps,
        supportsAudio: model.supportsAudio ?? false,
        supportsTextToVideo: model.supportsTextToVideo ?? false,
        supportsImageToVideo: model.supportsImageToVideo ?? false,
        runCount: model.runCount,
        tags: model.tags,
        popularity: model.popularity,
      },
      create: {
        modelId: model.id,
        name: model.name,
        provider: model.provider,
        description: model.description,
        pricePerSecond: model.pricing.perSecond,
        maxDuration: model.maxDuration,
        resolution: model.resolution,
        qualityScore: model.qualityScore,
        motionScore: model.motionScore,
        fps: model.fps,
        supportsAudio: model.supportsAudio ?? false,
        supportsTextToVideo: model.supportsTextToVideo ?? false,
        supportsImageToVideo: model.supportsImageToVideo ?? false,
        runCount: model.runCount,
        tags: model.tags,
        popularity: model.popularity,
      },
    });
  }
}

async function saveAudioModels(models: AudioModel[]) {
  for (const model of models) {
    await prisma.audioModel.upsert({
      where: { modelId: model.id },
      update: {
        name: model.name,
        provider: model.provider,
        description: model.description,
        type: model.type,
        pricePerMinute: model.pricing.perMinute,
        pricePerChar: model.pricing.perCharacter,
        languages: model.languages,
        qualityScore: model.qualityScore,
        naturalness: model.naturalness,
        accuracy: model.accuracy,
        voiceCloning: model.voiceCloning ?? false,
        emotionControl: model.emotionControl ?? false,
        realtime: model.realtime ?? false,
        runCount: model.runCount,
        tags: model.tags,
        popularity: model.popularity,
      },
      create: {
        modelId: model.id,
        name: model.name,
        provider: model.provider,
        description: model.description,
        type: model.type,
        pricePerMinute: model.pricing.perMinute,
        pricePerChar: model.pricing.perCharacter,
        languages: model.languages,
        qualityScore: model.qualityScore,
        naturalness: model.naturalness,
        accuracy: model.accuracy,
        voiceCloning: model.voiceCloning ?? false,
        emotionControl: model.emotionControl ?? false,
        realtime: model.realtime ?? false,
        runCount: model.runCount,
        tags: model.tags,
        popularity: model.popularity,
      },
    });
  }
}