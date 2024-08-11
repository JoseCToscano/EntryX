import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface Props {
  className?: string;
}
export const TciketSkeleton: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex h-96 flex-col items-center justify-start gap-2",
        className,
      )}
    >
      <Skeleton className="h-80 w-56" />
      <div className="flex w-full flex-col items-start justify-start gap-2">
        <Skeleton className="h-3 w-40" />
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-2 w-32" />
          <Skeleton className="h-2 w-6" />
        </div>
      </div>
    </div>
  );
};
