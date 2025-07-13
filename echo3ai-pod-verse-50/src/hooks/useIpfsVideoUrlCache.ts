import { useState, useEffect, useRef } from 'react';

// Singleton cache for CID -> URL
const ipfsUrlCache = new Map<string, string>();
const ipfsUrlErrorTimestamps = new Map<string, number>();

/**
 * Hook to fetch and cache IPFS video URLs per CID, with retry after 30 seconds if unavailable and 5s delay before each IPFS hit.
 * @param cid The IPFS content identifier for the video
 * @param gatewayUrl The base URL of your IPFS gateway (e.g., https://ipfs.io/ipfs/)
 * @returns { url, loading, error }
 */
export function useIpfsVideoUrlCache(cid: string, gatewayUrl: string = 'https://ipfs.io/ipfs/') {
  const [url, setUrl] = useState<string | null>(ipfsUrlCache.get(cid) || null);
  const [loading, setLoading] = useState<boolean>(!ipfsUrlCache.has(cid));
  const [error, setError] = useState<string | null>(null);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!cid) return;
    if (ipfsUrlCache.has(cid)) {
      setUrl(ipfsUrlCache.get(cid)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const tryFetch = () => {
      const videoUrl = `${gatewayUrl.replace(/\/$/, '')}/${cid}`;
      setTimeout(() => {
        fetch(videoUrl, { method: 'HEAD' })
          .then((res) => {
            if (res.ok) {
              ipfsUrlCache.set(cid, videoUrl);
              setUrl(videoUrl);
              setError(null);
              setLoading(false);
            } else {
              setUrl(null);
              setLoading(false);
              ipfsUrlErrorTimestamps.set(cid, Date.now());
              if (!cancelled) {
                retryTimeout.current = setTimeout(tryFetch, 30000);
              }
            }
          })
          .catch(() => {
            setUrl(null);
            setLoading(false);
            ipfsUrlErrorTimestamps.set(cid, Date.now());
            if (!cancelled) {
              retryTimeout.current = setTimeout(tryFetch, 30000);
            }
          });
      }, 5000); // 5 second delay before each IPFS hit
    };

    // Only retry if 30 seconds have passed since last error
    const lastError = ipfsUrlErrorTimestamps.get(cid);
    if (lastError && Date.now() - lastError < 30000) {
      const delay = 30000 - (Date.now() - lastError);
      retryTimeout.current = setTimeout(tryFetch, delay);
    } else {
      tryFetch();
    }

    return () => {
      cancelled = true;
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [cid, gatewayUrl]);

  return { url, loading, error };
} 