import React from "react";
import Link from "next/link";

const Footer = () => (
  <footer className="bottom-0 flex w-full flex-col items-center justify-center bg-muted p-6 md:py-12">
    <div className="container grid max-w-7xl grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:grid-cols-5">
      <div className="grid gap-1">
        <h3 className="font-semibold">Company</h3>
        <Link href="#" prefetch={false}>
          About Us
        </Link>
        <Link href="#" prefetch={false}>
          Our Team
        </Link>
        <Link href="#" prefetch={false}>
          Careers
        </Link>
        <Link href="#" prefetch={false}>
          News
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Products</h3>
        <Link href="#" prefetch={false}>
          Wallet
        </Link>
        <Link href="#" prefetch={false}>
          Swap
        </Link>
        <Link href="#" prefetch={false}>
          Earn
        </Link>
        <Link href="#" prefetch={false}>
          NFTs
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Resources</h3>
        <Link href="#" prefetch={false}>
          Blog
        </Link>
        <Link href="#" prefetch={false}>
          Documentation
        </Link>
        <Link href="#" prefetch={false}>
          Support
        </Link>
        <Link href="#" prefetch={false}>
          FAQs
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Legal</h3>
        <Link href="#" prefetch={false}>
          Privacy Policy
        </Link>
        <Link href="#" prefetch={false}>
          Terms of Service
        </Link>
        <Link href="#" prefetch={false}>
          Cookie Policy
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Connect</h3>
        <Link href="#" prefetch={false}>
          Twitter
        </Link>
        <Link href="#" prefetch={false}>
          Discord
        </Link>
        <Link href="#" prefetch={false}>
          Telegram
        </Link>
        <Link href="#" prefetch={false}>
          Medium
        </Link>
      </div>
    </div>
    <div className="mt-10 text-xs font-light">
      <p>© 2024 Entry•X | All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
