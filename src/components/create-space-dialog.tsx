
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
 import { useState } from "react";
import { Plus } from "lucide-react";

 import { createSpace } from "@/lib/actions/create-space";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface CreateSpaceDialogProps {
    workspaceId: string;
    trigger?: React.ReactNode;
}

const CreateSpaceSchema = z.object({
    name: z.string().min(1, "Space name is required"),
});

export const CreateSpaceDialog = ({
    workspaceId,
}: CreateSpaceDialogProps) => {
    const [open, setOpen] = useState(false);
     const [isPending, setIsPending] = useState(false);
     const color = "#3b82f6";
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const form = useForm<z.infer<typeof CreateSpaceSchema>>({
        resolver: zodResolver(CreateSpaceSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof CreateSpaceSchema>) => {
        setError("");
        setSuccess("");
         setIsPending(true);

         createSpace({ ...values, workspaceId, color })
             .then((data) => {
                 if (data?.error) {
                     setError(data.error);
                 } else if (data?.success) {
                     setSuccess(data.success);
                     setOpen(false);
                     window.location.reload();
                     form.reset();
                 }
                 setIsPending(false);
             })
             .catch(() => {
                 setError("Something went wrong");
                 setIsPending(false);
             });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <button className="flex items-center justify-center h-5 w-5 rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                                <Plus className="h-4 w-4" />
                            </button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>New Space</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Space</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Space Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            placeholder="e.g. Marketing, Development"
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
                            Create Space
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
