"use client";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";
import { Icons } from "~/components/icons";

export default function Component() {
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const sendForm = api.contact.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => {
      toast.success("Done. We'll get back to you soon!");
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    sendForm.mutate({
      name: data.name as string,
      email: data.email as string,
      subject: data.subject as string,
      message: data.message as string,
    });
    reset();
  };

  return (
    <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
      <div className="container grid gap-10 px-4 md:px-6">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Get in touch
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Have a question or need help? Fill out the form below and
            we&quote;ll get back to you as soon as possible.
          </p>
        </div>
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="my-4">
            <form className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    register={register}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    register={register}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  register={register}
                  placeholder="Enter the subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  register={register}
                  placeholder="Enter your message"
                  className="min-h-[150px]"
                />
              </div>
              <Button
                disabled={sendForm.isPaused}
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="border-lack h-8 w-full border-[1px] bg-black text-white hover:bg-white hover:text-black"
              >
                {sendForm.isPending ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
