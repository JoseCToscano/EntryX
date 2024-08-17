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
import React, { useCallback, useEffect, useState } from "react";
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
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  type FieldValues,
  type SubmitHandler,
  useForm,
  type UseFormRegister,
} from "react-hook-form";
import { api } from "~/trpc/react";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";

function CompanyContactForm(
  step: number,
  register: UseFormRegister<FieldValues>,
  experiencedBlockchain: string,
  setExperiencedBlockchain: (value: string) => void,
) {
  return (
    <TabsContent value="company" className="mt-4">
      <form className="grid gap-4">
        {step === 0 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company name</Label>
              <Input
                register={register}
                id="name"
                placeholder="Enter your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Company Email</Label>
              <Input
                register={register}
                id="email"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                register={register}
                id="phone"
                type="tel"
                placeholder="(+##) ### ### ####"
              />
              <label
                className={`-translate-y-2 translate-x-1 text-xs font-light text-neutral-400 duration-150 hover:cursor-text`}
              >
                Include country code
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event">Event</Label>
              <Textarea
                register={register}
                id="event"
                placeholder="Tell us about the event you want to list"
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
              <Select
                onValueChange={setExperiencedBlockchain}
                value={experiencedBlockchain}
              >
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
                    <SelectItem value="comfortable">
                      I am comfortable using blockchain technology
                    </SelectItem>
                    <SelectItem value="deep">
                      I have deep knowledge of blockchain technology
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Referral Source</Label>
              <Input
                id="source"
                register={register}
                placeholder="How did you hear about us?"
              />
            </div>
          </div>
        )}
      </form>
    </TabsContent>
  );
}

function IndividualContactForm(
  step = 0,
  register: UseFormRegister<FieldValues>,
  experiencedBlockchain: string,
  setExperiencedBlockchain: (value: string) => void,
) {
  return (
    <TabsContent value="individual" className="mt-4">
      <form className="grid gap-4">
        {step === 0 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                register={register}
                placeholder="Enter your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                register={register}
                placeholder="Enter your email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                register={register}
                placeholder="(+##) ### ### ####"
              />
              <label
                className={`-translate-y-2 translate-x-1 text-xs font-light text-neutral-400 duration-150 hover:cursor-text`}
              >
                Include country code
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event">Event</Label>
              <Textarea
                id="event"
                register={register}
                placeholder="Tell us about the event you want to list"
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
              <Select
                onValueChange={setExperiencedBlockchain}
                value={experiencedBlockchain}
              >
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
                    <SelectItem value="comfortable">
                      I am comfortable using blockchain technology
                    </SelectItem>
                    <SelectItem value="deep">
                      I have deep knowledge of blockchain technology
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Referral Source</Label>
              <Input
                register={register}
                id="source"
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
  const searchParams = useSearchParams();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isFamiliarWithStellar, isFamiliarWitheptStellar] = useState(false);
  const [acceptMarketingUpdates, setAcceptMarketingUpdates] = useState(false);
  const [experiencedBlockchain, setExperiencedBlockchain] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const sendForm = api.joinWaitlist.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => {
      toast.success("Done. We'll get back to you soon!");
    },
  });

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      source: "",
      event: "",
    },
  });

  useEffect(() => {
    console.log(experiencedBlockchain);
  }, [experiencedBlockchain]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    sendForm.mutate({
      name: data.name as string,
      email: data.email as string,
      phone: data.phone as string,
      event: data.event as string,
      referalSource: data.source as string,
      isFamiliarWithStllar: isFamiliarWithStellar,
      acceptMarketing: acceptMarketingUpdates,
      experienceWithBlockchain: experiencedBlockchain,
    });
    reset();
    setStep(0);
  };

  const toggleTerms = () => setAcceptTerms((prev) => !prev);
  const toggleStellar = () => isFamiliarWitheptStellar((prev) => !prev);
  const toggleMarketingUpdates = () =>
    setAcceptMarketingUpdates((prev) => !prev);

  return (
    <Dialog
      defaultOpen={!!searchParams.get("joinWaitlist")}
      onOpenChange={(isOpen) => {
        setStep(0);
        if (isOpen) {
          router.push(
            pathname + "?" + createQueryString("joinWaitlist", "true"),
          );
        } else {
          router.push(pathname + "?" + createQueryString("joinWaitlist", ""));
        }
      }}
    >
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
          {IndividualContactForm(
            step,
            register,
            experiencedBlockchain,
            setExperiencedBlockchain,
          )}
          {CompanyContactForm(
            step,
            register,
            experiencedBlockchain,
            setExperiencedBlockchain,
          )}
        </Tabs>
        {step === 1 && (
          <div className="m-2 grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onClick={toggleTerms}
              />
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
              <Checkbox
                id="stellar-account"
                checked={isFamiliarWithStellar}
                onClick={toggleStellar}
              />
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
              <Checkbox
                id="marketing-updates"
                checked={acceptMarketingUpdates}
                onClick={toggleMarketingUpdates}
              />
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
              disabled={!acceptTerms}
              onClick={handleSubmit(onSubmit)}
              type="submit"
              className="w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
            >
              Join waitlist {JSON.stringify(acceptTerms)}
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
