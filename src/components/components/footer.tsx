import React from "react";
import Link from "next/link";

const Footer = () => (
  <footer className="bottom-0 mt-40 flex w-full flex-col items-center justify-center bg-muted p-6 md:py-12">
    <div className="container grid max-w-7xl grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:grid-cols-4">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">Entry•X</h1>
        <p className="text-xs font-light">
          Entry•X is a decentralized platform designed to distribute and manage
          digital tickets.
        </p>
        <p className="text-xs font-light text-muted-foreground">
          A transparent, secure and reliable solution for event organizers and
          ticket buyers.
        </p>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Resources</h3>
        <Link href="/blog" prefetch={false}>
          Blog
        </Link>

        <Link href="/support" prefetch={false}>
          Support
        </Link>
        <Link href="/faq" prefetch={false}>
          FAQs
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Legal</h3>
        <Link href="/privacy-policy" prefetch={false}>
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" prefetch={false}>
          Terms of Service
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Connect</h3>
        <Link href="/contact" prefetch={false}>
          Contact us
        </Link>
      </div>
    </div>
    <div className="mt-10 text-xs font-light">
      <p>© 2024 Entry•X | All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
