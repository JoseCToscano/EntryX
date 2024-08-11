/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Dg4aTbqETKK
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import Footer from "~/components/components/footer";

export default function Component() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F5F5F5] px-4 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto mb-20 max-w-md text-center">
        <div className="inline-block rounded-lg bg-gradient-to-br from-black to-gray-400 px-3 py-1 text-sm font-medium text-white">
          404 Not Found
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#0E0E0E] sm:text-5xl">
          Oops, something went wrong!
        </h1>
        <p className="mt-4 text-[#6B7280]">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get
          you back on track.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-gradient-to-br from-black to-gray-400 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#F0B90B]/90 focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:ring-offset-2"
            prefetch={false}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
      <section className="mt-20">
        <Footer />
      </section>
    </div>
  );
}
