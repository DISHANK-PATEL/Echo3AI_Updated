import { useState, useEffect } from 'react';

// Singleton cache for CID -> URL
const ipfsUrlCache = new Map<string, string>();

/**
 * Hook to fetch and cache IPFS video URLs per CID.
 * @param cid The IPFS content identifier for the video
 * @param gatewayUrl The base URL of your IPFS gateway (e.g., https://ipfs.io/ipfs/)
 * @returns { url, loading, error }
 */
export function useIpfsVideoUrlCache(cid: string, gatewayUrl: string = 'https://ipfs.io/ipfs/') {
  const [url, setUrl] = useState<string | null>(ipfsUrlCache.get(cid) || null);
  const [loading, setLoading] = useState<boolean>(!ipfsUrlCache.has(cid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) return;
    if (ipfsUrlCache.has(cid)) {
      setUrl(ipfsUrlCache.get(cid)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // Simulate a fetch to check if the video is available at the gateway
    const videoUrl = `${gatewayUrl.replace(/\/$/, '')}/${cid}`;
    fetch(videoUrl, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          ipfsUrlCache.set(cid, videoUrl);
          setUrl(videoUrl);
        } else {
          setError('Video not found on IPFS gateway.');
        }
      })
      .catch(() => setError('Failed to fetch video from IPFS gateway.'))
      .finally(() => setLoading(false));
  }, [cid, gatewayUrl]);

  return { url, loading, error };
} 