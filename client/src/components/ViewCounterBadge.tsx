import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface ViewCounterBadgeProps {
  count: number;
  className?: string;
}

export function ViewCounterBadge({ count, className = "" }: ViewCounterBadgeProps) {
  const [prevCount, setPrevCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count > prevCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      setPrevCount(count);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-xl transition-transform duration-300 ${
        isAnimating ? "scale-110" : "scale-100"
      } ${className}`}
      data-testid="badge-view-counter"
    >
      <Eye className="w-5 h-5 text-chart-4" />
      <span className="text-lg font-bold text-white tabular-nums" data-testid="text-view-count">
        {count.toLocaleString()}
      </span>
    </div>
  );
}
