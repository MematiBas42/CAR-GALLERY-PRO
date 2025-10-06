"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { readStreamableValue, useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/_actions/ai";

import React, { useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SingleImageSchema,
  SingleImageType,
} from "@/app/schemas/images.schema";
import { StreamableSkeletonProps } from "./StreamableSkeletion";
import { CarAISchema } from "@/app/schemas/car-ai";
import { z } from "zod";
import { createCarAction } from "@/app/_actions/car";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import SingleImageUploader from "./SingleImageUploader";

const CreateCarDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, startUploadTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();

  const { generateCar } = useActions<typeof AI>();
  const [messages, setMessages] = useUIState<typeof AI>();

  const imageForm = useForm<SingleImageType>({
    resolver: zodResolver(SingleImageSchema),
  });

  const createForm = useForm<StreamableSkeletonProps>({
    resolver: zodResolver(
      CarAISchema.extend({
        make: z.object({
          id: z.number().int(),
          name: z.string(),
          image: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      })
    ),
  });

  const handleImageUpload = async (url: string) => {
    imageForm.setValue("image", url);
  };

  const onImageSubmit: SubmitHandler<SingleImageType> = async (data) => {
    startUploadTransition(async () => {
      const responseMessage = await generateCar(data.image);
      if (!responseMessage) return;
      setMessages((prev) => [...prev, responseMessage]);
      for await (const value of readStreamableValue(responseMessage.car)) {
        if (value) {
          createForm.reset(value);
        }
      }
    });
  };

  const onCreateSubmit: SubmitHandler<StreamableSkeletonProps> = (data) => {
    startCreateTransition(async () => {
      setMessages([]);
      const { success, message } = await createCarAction(data);

      if (!success) {
        toast.error("Error", {
          description: message || "Something went wrong",
          duration: 3000,
        });
      }
    });
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4" size={"sm"}>
          Add new
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(` bg-white max-w-7xl`)}>
        <DialogHeader>
          <DialogTitle>Create new car</DialogTitle>
        </DialogHeader>
        {messages.length ? (
          <Form {...createForm}>
            <form
              className="space-y-4"
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
            >
              {messages.map((message) => (
                <div className="w-full" key={message.id}>
                  {message.display}
                </div>
              ))}
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isCreating || isUploading}
                  type="submit"
                  className="flex items-center gap-x-2"
                >
                  {isCreating || isUploading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : null}
                  {isUploading ? "Uploading..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...imageForm}>
            <form
              onSubmit={imageForm.handleSubmit(onImageSubmit)}
              className="space-y-4"
            >
              <SingleImageUploader onUploadComplete={handleImageUpload} />
              <div className="flex justify-between gap-2">
                <Button
                  variant={"outline"}
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isUploading}
                  type="submit"
                  className="flex items-center gap-x-2"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Upload Image"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateCarDialog;
