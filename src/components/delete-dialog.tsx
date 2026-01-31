
"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTransition } from "react";

interface DeleteDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    description?: string;
    onConfirm: () => Promise<void>;
}

export const DeleteDialog = ({ open, setOpen, title, description, onConfirm }: DeleteDialogProps) => {
    const [isPending, startTransition] = useTransition();

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description || "This action cannot be undone."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700"
                        onClick={(e) => {
                            e.preventDefault();
                            startTransition(() => {
                                void (async () => {
                                    await onConfirm();
                                    setOpen(false);
                                })();
                            });
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
