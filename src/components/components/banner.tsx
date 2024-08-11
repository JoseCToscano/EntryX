"use client";

import React, { type ReactNode } from "react";
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import { cn } from "~/lib/utils";

type BannerProps = {
  title: string;
  content: ReactNode;
  buttonText: string;
  defaultOpen?: boolean;
  footer?: ReactNode;
  actions?: ReactNode;
  TitleIcon?: ReactNode;
  className?: string;
};

const Banner: React.FC<BannerProps> = ({
  defaultOpen,
  title,
  content,
  footer,
  buttonText,
  actions,
  TitleIcon,
  className,
}) => {
  const [showBanner, setShowBanner] = React.useState<boolean>(!!defaultOpen);

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        `fixed bottom-5 z-50 mx-5 flex flex-col space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-lg sm:left-5 sm:mx-auto sm:max-w-sm`,
        className,
      )}
    >
      <h3 className="flex flex-row justify-between pb-2 text-lg font-semibold">
        <div className="flex flex-row items-center justify-start gap-1">
          {title}
          {TitleIcon}
        </div>
        <button onClick={() => setShowBanner(false)}>
          <CloseIcon />
        </button>
      </h3>
      {content}
      <div className="mt-2 flex space-x-5">
        <button
          onClick={() => {
            setShowBanner(false);
          }}
          className="mt-4 w-full rounded-md border border-gray-300 p-2 text-center text-sm font-medium text-gray-500 transition-all hover:border-gray-700 hover:text-gray-600"
        >
          {buttonText}
        </button>
        {actions}
      </div>
      {footer}
    </div>
  );
};

export default Banner;
