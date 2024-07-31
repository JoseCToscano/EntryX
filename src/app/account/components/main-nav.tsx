import React from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";

interface MainNavProps {
  className?: string;
  sections: {
    name: string;
    href: string;
  }[];
}
export const MainNav: React.FC<MainNavProps> = ({ className, ...props }) => {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {props.sections.map((section) => (
        <Link
          key={section.name}
          href={section.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {section.name}
        </Link>
      ))}
    </nav>
  );
};
