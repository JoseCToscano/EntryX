"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/0mkETaxElJx
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import Link from "next/link";
import { Icons } from "~/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import React, { useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

function CompanyContactForm(step: number) {
  return (
    <TabsContent value="company" className="mt-4">
      <form className="grid gap-4">
        {step === 0 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Company Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" placeholder="(+52) 331 341 5550" />
              <label
                className={`-translate-y-2 translate-x-1 text-xs font-light text-neutral-400 duration-150 hover:cursor-text`}
              >
                Include country code
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-description">Event</Label>
              <Textarea
                id="event-description"
                placeholder="Tell us about a little about the event you want to list"
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="blockchain-familiarity">
                Familiarity with Blockchain
              </Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="What's your experience with blockchain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Blockchain experience</SelectLabel>
                    <SelectItem value="beginner">
                      I have little to no knowledge of blockchain technology
                    </SelectItem>
                    <SelectItem value="some">
                      I have basic understanding of blockchain concepts
                    </SelectItem>
                    <SelectItem value="blueberry">
                      I am comfortable using blockchain technology
                    </SelectItem>
                    <SelectItem value="grapes">
                      I have deep knowledge of blockchain technology
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referral-source">Referral Source</Label>
              <Input
                id="referral-source"
                placeholder="How did you hear about us?"
              />
            </div>
          </div>
        )}
      </form>
    </TabsContent>
  );
}

function IndividualContactForm(step = 0) {
  return (
    <TabsContent value="individual" className="mt-4">
      <form className="grid gap-4">
        {step === 0 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
              />
              <label
                className={`-translate-y-2 translate-x-1 text-xs font-light text-neutral-400 duration-150 hover:cursor-text`}
              >
                Include country code
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-description">Event</Label>
              <Textarea
                id="event-description"
                placeholder="Tell us about a little about the event you want to list"
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="blockchain-familiarity">
                Familiarity with Blockchain
              </Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="What's your experience with blockchain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Blockchain experience</SelectLabel>
                    <SelectItem value="beginner">
                      I have little to no knowledge of blockchain technology
                    </SelectItem>
                    <SelectItem value="some">
                      I have basic understanding of blockchain concepts
                    </SelectItem>
                    <SelectItem value="blueberry">
                      I am comfortable using blockchain technology
                    </SelectItem>
                    <SelectItem value="grapes">
                      I have deep knowledge of blockchain technology
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referral-source">Referral Source</Label>
              <Input
                id="referral-source"
                placeholder="How did you hear about us?"
              />
            </div>
          </div>
        )}
      </form>
    </TabsContent>
  );
}
export default function JoinWaitlistDialog() {
  const [step, setStep] = useState(0);
  return (
    <Dialog onOpenChange={() => setStep(0)}>
      <DialogTrigger asChild>
        <Button className="group w-[250px] border-[1px] border-black bg-black pr-2 text-white hover:bg-white hover:text-black">
          Join the Waitlist
          <Icons.expandingArrow className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Join the Waitlist</DialogTitle>
          <DialogDescription>
            Request access to our decentralized ticketing platform for your
            events.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="individual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="" value="individual">
              Individual
            </TabsTrigger>
            <TabsTrigger className="" value="company">
              Company
            </TabsTrigger>
          </TabsList>
          {IndividualContactForm(step)}
          {CompanyContactForm(step)}
        </Tabs>
        {step === 1 && (
          <div className="m-2 grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">
                I agree to the{" "}
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  className="underline underline-offset-2"
                  prefetch={false}
                >
                  terms and conditions
                </Link>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="stellar-account" />
              <Label htmlFor="stellar-account">
                <span className="flex">
                  Are you familiar with{" "}
                  <Image
                    className="mx-1"
                    width={15}
                    height={15}
                    src={"/icons/stellar-xlm-logo.svg"}
                    alt={"Stellar XLM icon"}
                  />{" "}
                  <Link href="https://stellar.org/" className="underline">
                    Stellar
                  </Link>
                  ?
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="marketing-updates" />
              <Label htmlFor="marketing-updates">
                I would like to receive updates and news about the platform
              </Label>
            </div>
          </div>
        )}
        <DialogFooter>
          {step < 1 && (
            <Button
              onClick={() => {
                console.log("step:", step);
                setStep(() => step + 1);
              }}
              type="submit"
              className="group w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
            >
              Continue
              <Icons.expandingArrow className="h-4 w-4" />
            </Button>
          )}
          {step === 1 && (
            <Button
              onClick={() => setStep(0)}
              type="submit"
              className="group border-[1px] border-black bg-black px-4 text-white hover:bg-white hover:text-black"
            >
              <ExpandingArrowLeft />
            </Button>
          )}
          {step === 1 && (
            <Button
              onClick={() => setStep(0)}
              type="submit"
              className="w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
            >
              Join waitlist
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExpandingArrowLeft({ className }: { className?: string }) {
  return (
    <div className="group relative flex items-center">
      <svg
        className={`${
          className ? className : "h-4 w-4"
        } absolute -translate-x-1 rotate-180 transform transition-all group-hover:-translate-x-2 group-hover:opacity-0`}
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 16"
        width="16"
        height="16"
      >
        <path
          fillRule="evenodd"
          d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"
        ></path>
      </svg>
      <svg
        className={`${
          className ? className : "h-4 w-4"
        } absolute -translate-x-2 rotate-180 transform opacity-0 transition-all group-hover:-translate-x-2 group-hover:opacity-100`}
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 16"
        width="16"
        height="16"
      >
        <path
          fillRule="evenodd"
          d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"
        ></path>
      </svg>
    </div>
  );
}