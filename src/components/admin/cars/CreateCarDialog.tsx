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
import React, { useState } from "react";
import CarForm from "../../car/car-form";


const CreateCarDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4" size={"sm"}>
          Add new
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(`bg-card max-w-6xl`)}>
        <DialogHeader>
          <DialogTitle>Create new car</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-1">
            <CarForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCarDialog;