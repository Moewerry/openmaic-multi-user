/** Client-side retry budget for long-running scene HTTP calls (content, actions, TTS). */
export const SCENE_GENERATION_RETRY_OPTIONS = {
  maxRetries: 2,
} as const;
