import { describe, expect, it } from 'vitest';
import { FOREGROUND_SCENE_RETRY_OPTIONS } from '@/app/generation-preview/foreground-retry';
import { SCENE_GENERATION_RETRY_OPTIONS } from '@/lib/generation/scene-retry-options';

describe('foreground scene retry budget', () => {
  it('limits the visible first scene to two retries', () => {
    expect(FOREGROUND_SCENE_RETRY_OPTIONS.maxRetries).toBe(2);
    expect(SCENE_GENERATION_RETRY_OPTIONS).toBe(FOREGROUND_SCENE_RETRY_OPTIONS);
  });
});
