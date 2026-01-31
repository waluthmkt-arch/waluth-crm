
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { createList } from "@/actions/create-list";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

interface CreateListDialogProps {
    spaceId: string;
    folderId?: string; // Optional if creating list directly in space
    open: boolean;
    setOpen: (open: boolean) => void;
}

const CreateListSchema = z.object({
    name: z.string().min(1, "List name is required"),
});

export const CreateListDialog = ({
    spaceId,
    folderId,
    open,
    setOpen
}: CreateListDialogProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const form = useForm<z.infer<typeof CreateListSchema>>({
        resolver: zodResolver(CreateListSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof CreateListSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            createList({ ...values, spaceId, folderId })
                .then((data) => {
                    if (data?.error) {
                        setError(data.error);
                    } else if (data?.success) {
                        setSuccess(data.success);
                        setOpen(false);
                        router.refresh();
                        form.reset();
                    }
                })
                .catch(() => setError("Something went wrong!"));
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create List</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>List Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            placeholder="e.g. To Do, Backlog"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button disabled={isPending} type="submit" className="w-full">
                            Create List
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
