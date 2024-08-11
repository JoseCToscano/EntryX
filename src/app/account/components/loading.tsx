import { Icons } from "~/components/icons";

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Icons.spinner className="h-6 w-6 text-black" />
    </div>
  );
}
