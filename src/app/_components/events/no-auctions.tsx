import Link from "next/link";

export default function NoAuctions() {
  return (
    <section className="flex w-full flex-col items-center justify-center bg-muted py-12 md:py-24">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold text-foreground">No Results</h2>
        <p className="max-w-md text-muted-foreground">
          It looks like there are no ongoing auctions that match your search
          criteria. Try searching for events to find something that interests
          you.
        </p>
        <Link
          href="/events"
          className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          prefetch={false}
        >
          Search for Events
        </Link>
      </div>
    </section>
  );
}
