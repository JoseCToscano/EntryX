/**
 * v0 by Vercel.
 * @see https://v0.dev/t/L3HRyFOavtW
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client";

import React, { useState, useMemo } from "react";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { useParams } from "next/navigation";

const SecondaryMarket: React.FC = () => {
  // Use the useParams hook to access the dynamic parameters
  const params = useParams();
  // Extract the id from the params object
  const { id } = params;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    event: "",
    date: "",
    price: "",
  });
  const tickets = [
    {
      id: 1,
      event: "Coachella Music Festival",
      date: "April 14-16, 2023",
      location: "Indio, CA",
      price: 499.99,
    },
    {
      id: 2,
      event: "Lollapalooza",
      date: "July 28-31, 2023",
      location: "Chicago, IL",
      price: 375.0,
    },
    {
      id: 3,
      event: "Bonnaroo Music & Arts Festival",
      date: "June 15-18, 2023",
      location: "Manchester, TN",
      price: 299.99,
    },
    {
      id: 4,
      event: "Austin City Limits Music Festival",
      date: "October 6-8 & 13-15, 2023",
      location: "Austin, TX",
      price: 325.0,
    },
    {
      id: 5,
      event: "Glastonbury Festival",
      date: "June 21-25, 2023",
      location: "Pilton, UK",
      price: 335.0,
    },
  ];
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const eventMatch = filterOptions.event
        ? ticket.event.toLowerCase().includes(filterOptions.event.toLowerCase())
        : true;
      const dateMatch = filterOptions.date
        ? ticket.date.toLowerCase().includes(filterOptions.date.toLowerCase())
        : true;
      const priceMatch = filterOptions.price
        ? ticket.price <= parseFloat(filterOptions.price)
        : true;
      const searchMatch = searchTerm
        ? ticket.event.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return eventMatch && dateMatch && priceMatch && searchMatch;
    });
  }, [searchTerm, filterOptions]);

  if (!id) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <MenuBreadcumb id={id as string} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Secondary Market</h2>
        <p className="text-muted-foreground">
          Buy and sell tickets for your favorite events.
        </p>
      </div>
      <div className="mb-8">
        <div className="mb-4 flex items-center">
          <Input
            id="event-filter"
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-4 flex-1"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-4">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="event-filter"
                    className="mb-2 block font-medium"
                  >
                    Event
                  </label>
                  <Input
                    id="event-filter"
                    type="text"
                    placeholder="Search events..."
                    value={filterOptions.event}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        event: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="date-filter"
                    className="mb-2 block font-medium"
                  >
                    Date
                  </label>
                  <Input
                    id="date-filter"
                    type="text"
                    placeholder="Search dates..."
                    value={filterOptions.date}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="price-filter"
                    className="mb-2 block font-medium"
                  >
                    Price
                  </label>
                  <Input
                    id="price-filter"
                    type="number"
                    placeholder="Max price..."
                    value={filterOptions.price}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="h-full">
              <CardHeader>
                <CardTitle>{ticket.event}</CardTitle>
                <CardDescription>{ticket.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">{ticket.location}</div>
                  <div className="font-bold">${ticket.price.toFixed(2)}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Buy Ticket</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button>List Your Tickets</Button>
      </div>
    </div>
  );
};

function FilterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default SecondaryMarket;
