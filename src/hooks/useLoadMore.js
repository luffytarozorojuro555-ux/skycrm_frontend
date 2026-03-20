import { useState, useMemo } from "react";

export default function useLoadMore(data = [], initialCount = 50, step = 50) {
  const [visibleCount, setVisibleCount] = useState(initialCount);


  const safeData = Array.isArray(data) ? data : [];

  const visibleData = useMemo(
    () => safeData.slice(0, visibleCount),
    [safeData, visibleCount]
  );

  const handleLoadMore = () => setVisibleCount((prev) => prev + step);

  const hasMore = visibleCount < safeData.length;

  return { visibleData, handleLoadMore, hasMore };
}
