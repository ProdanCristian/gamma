import useSWR, { SWRConfiguration } from "swr";
import { useRef, useEffect } from "react";

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 1000,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  errorRetryInterval: 500,
  suspense: false,
};

export function useStableQuery(
  key: string | null,
  fetcher?: any,
  options?: SWRConfiguration
) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stableFetcher = async (url: string) => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Only process the response if the component is still mounted
      if (isMountedRef.current) {
        const data = await response.json();
        return data;
      }

      return null;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return null;
      }
      throw error;
    }
  };

  return useSWR(key, key ? stableFetcher : null, {
    ...defaultConfig,
    ...options,
    fallbackData: null,
    revalidateIfStale: true,
    revalidateOnMount: true,
    dedupingInterval: 0,
    focusThrottleInterval: 0,
  });
}
