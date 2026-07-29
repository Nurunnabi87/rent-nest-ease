import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dimension = size === "sm" ? "size-3.5" : "size-5";
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            dimension,
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          )}
        />
      ))}
    </span>
  );
}
