"use client";
import { DisplayEvents } from "../_components/events/display-events";
import { Suspense } from "react";
import Loading from "~/app/account/components/loading";

export default function AllEventsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DisplayEvents />
    </Suspense>
  );
}
