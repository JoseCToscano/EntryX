import { cn } from "~/lib/utils";

export const PhotoAttributes: React.FC<{
  author: string;
  url: string;
  className?: string;
}> = ({ author, url, className }) => {
  return (
    <p
      className={cn(
        "w-full -translate-y-4 bg-none pr-2 text-right text-[10px] font-light text-neutral-400 opacity-60",
        className,
      )}
    >
      Photo by{" "}
      <a href="https://unsplash.com/es/@fakurian?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
        {author}
      </a>{" "}
      on <a href={url}>Unsplash</a>
    </p>
  );
};
