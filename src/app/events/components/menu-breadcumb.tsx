import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import Link from "next/link";
import { api } from "~/trpc/react";

export const MenuBreadcumb: React.FC<{
  id?: string;
  actionSection?: string;
}> = ({ id, actionSection }) => {
  const { data: event, isLoading } = api.event.get.useQuery(
    { id: id ?? "" },
    { enabled: !!id },
  );
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/events" prefetch={false}>
                Events
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {id && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  {isLoading ? (
                    "..."
                  ) : (
                    <Link href={`/events/${id}`}>{event?.name}</Link>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {actionSection && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{actionSection}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};
