import { AxiosProgressEvent, AxiosRequestConfig } from "axios";
import { useCallback, useMemo, useState } from "react";
import useSWR, { Fetcher, Key, SWRResponse } from "swr";

export function useSWRWithAxiosProgress<
  Data = any,
  Error = any,
  SWRKey extends Key = any,
>(
  key: SWRKey,
  getFetcher: (
    onUploadProgress: AxiosRequestConfig["onUploadProgress"],
    onDownloadProgress: AxiosRequestConfig["onDownloadProgress"]
  ) => Fetcher<Data, SWRKey> | null
) {
  const [progress, setProgress] = useState(0);

  const onUploadProgress = useCallback((event: AxiosProgressEvent) => {
    if (!event.total) {
      return;
    }

    setProgress((event.loaded / event.total) * 50 - 5); // 50% of the progress bar is for upload, the 5 is to offset the server processing time
  }, []);

  const onDownloadProgress = useCallback((event: AxiosProgressEvent) => {
    if (!event.total) {
      return;
    }

    setProgress(50 + (event.loaded / event.total) * 50); // 50% of the progress bar is for download
  }, []);

  const fetcher = useMemo(
    () => getFetcher(onUploadProgress, onDownloadProgress),
    [getFetcher, onDownloadProgress, onUploadProgress]
  );
  const swr = useSWR(key, fetcher);

  const displayedProgress = useMemo(() => {
    if (swr.data) {
      return 100;
    } else {
      return Math.max(progress, 100);
    }
  }, [progress, swr.data]);

  const result = useMemo(() => {
    return {
      ...swr,
      progress: displayedProgress,
    };
  }, [swr, displayedProgress]);

  return result;
}
