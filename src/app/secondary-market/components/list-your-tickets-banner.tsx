import Banner from "~/components/components/banner";
import React from "react";
import Link from "next/link";

export default function ListYourTicketsBanner() {
  return (
    <Banner
      title={"You can now sell your tickets"}
      content={
        <>
          <p className="text-sm text-gray-500">
            Place any ticket you want to sell in the secondary market and get
            paid in XLM.
          </p>
          <p className="text-sm text-gray-500">
            Auctioning can result in higher payouts. Learn more about the
            secondary market and how to list your tickets{" "}
            <Link
              className="text-blue-500 underline"
              href={"/list-my-tickets"}
              target="_blank"
            >
              here
            </Link>
          </p>
        </>
      }
      buttonText={"Awesome!"}
      defaultOpen
    />
  );
}
