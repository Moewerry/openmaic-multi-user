/**
 * HTTP fetch for LLM API calls with extended undici timeouts.
 *
 * Node's built-in fetch defaults to a 300s headersTimeout, which is too short
 * for non-streaming scene-content generation against slower providers (e.g. GLM).
 */

/** Align with long-running generate route maxDuration (10 min). */
export const LLM_HTTP_TIMEOUT_MS = 600_000;

type FetchFn = typeof globalThis.fetch;

let agent: import('undici').Agent | undefined;

async function undiciFetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const { Agent, fetch } = (await import(/* webpackIgnore: true */ 'undici')) as {
    Agent: new (options: {
      headersTimeout: number;
      bodyTimeout: number;
      connectTimeout: number;
    }) => import('undici').Agent;
    fetch: (
      input: string | URL | Request,
      init?: RequestInit & { dispatcher?: import('undici').Agent },
    ) => Promise<Response>;
  };

  agent ??= new Agent({
    headersTimeout: LLM_HTTP_TIMEOUT_MS,
    bodyTimeout: LLM_HTTP_TIMEOUT_MS,
    connectTimeout: 60_000,
  });

  return fetch(url, { ...init, dispatcher: agent });
}

/**
 * Fetch wrapper for LLM HTTP calls. Uses undici with extended timeouts in
 * production; delegates to globalThis.fetch under Vitest so existing tests
 * can stub fetch normally.
 */
export const llmFetch: FetchFn = (url, init) => {
  if (process.env.VITEST) {
    return globalThis.fetch(url, init);
  }
  return undiciFetch(url, init);
};
