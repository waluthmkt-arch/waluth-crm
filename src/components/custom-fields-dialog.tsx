
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { Plus, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { FIELD_TYPES } from "@/lib/field-types";
import { EditCustomFieldDialog } from "@/components/edit-custom-field-dialog";
import * as Icons from "lucide-react";

interface CustomFieldsDialogProps {
    listId: string;
    workspaceId: string;
    trigger?: React.ReactNode;
    existingFields?: any[];
}

const CreateFieldSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "CHECKBOX", "CURRENCY", "RATING"]),
});

export const CustomFieldsDialog = ({
    listId,
    workspaceId,
    trigger,
    existingFields = []
}: CustomFieldsDialogProps) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [editingField, setEditingField] = useState<any | null>(null);

    const form = useForm<z.infer<typeof CreateFieldSchema>>({
        resolver: zodResolver(CreateFieldSchema),
        defaultValues: {
            name: "",
            type: "TEXT",
        },
    });

    const [deletePending, startDeleteTransition] = useTransition();

    const onSubmit = (values: z.infer<typeof CreateFieldSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            void (async () => {
                try {
                    const { data: auth } = await supabase.auth.getUser();
                    const userId = auth.user?.id;

                    if (!userId) {
                        setError("You must be logged in to create custom fields.");
                        return;
                    }

                    const { error } = await supabase
                        .from("custom_fields")
                        .insert({
                            name: values.name,
                            type: values.type,
                            list_id: listId,
                            created_by: userId,
                            pinned: false,
                            required: false,
                            hide_empty: false,
                            visibility: "all",
                        })
                        .select("id")
                        .single();

                    if (error) {
                        setError(error.message);
                        return;
                    }

                    void workspaceId; // currently unused; kept for API compatibility
                    setSuccess("Custom field created");
                    form.reset();
                    navigate(0);
                } catch {
                    setError("Something went wrong!");
                }
            })();
        });
    };

    const handleDelete = (fieldId: string) => {
        startDeleteTransition(() => {
            void (async () => {
                const { error } = await supabase
                    .from("custom_fields")
                    .delete()
                    .eq("id", fieldId)
                    .eq("list_id", listId);

                if (error) {
                    setError(error.message);
                    return;
                }

                void workspaceId;
                navigate(0);
            })();
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm" className="h-8">
                            <Plus className="h-4 w-4 mr-2" />
                            Custom Field
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="max-w-2xl flex gap-6 h-[500px]">
                    {/* Left: Create Form */}
                    <div className="w-[300px] border-r pr-6 space-y-4">
                        <DialogHeader>
                            <DialogTitle>New Custom Field</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="e.g. Budget"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                disabled={isPending}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(FIELD_TYPES).map(([key, info]) => {
                                                        const Icon = (Icons as any)[info.icon];
                                                        return (
                                                            <SelectItem key={key} value={key}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: info.color }}>
                                                                        {Icon && <Icon className="w-2.5 h-2.5 text-white" />}
                                                                    </div>
                                                                    {info.label}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormError message={error} />
                                <FormSuccess message={success} />
                                <Button disabled={isPending} type="submit" className="w-full">
                                    Create Field
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Right: Existing Fields List */}
                    <div className="flex-1 overflow-y-auto">
                        <h3 className="font-semibold mb-4">Existing Fields</h3>
                        {existingFields.length === 0 ? (
                            <div className="text-sm text-gray-500 italic">No custom fields yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {existingFields.map((field) => {
                                    const fieldTypeInfo = FIELD_TYPES[field.type as keyof typeof FIELD_TYPES];
                                    const Icon = fieldTypeInfo ? (Icons as any)[fieldTypeInfo.icon] : Icons.Circle;

                                    return (
                                        <div key={field.id} className="flex items-center justify-between p-2 rounded border bg-gray-50 hover:bg-white hover:shadow-sm transition-all group">
                                            <div className="flex items-center gap-2 flex-1">
                                                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: fieldTypeInfo?.color || "#6b7280" }}>
                                                    {Icon && <Icon className="w-3 h-3 text-white" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{field.name}</p>
                                                    <p className="text-xs text-gray-400">{fieldTypeInfo?.label || field.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-blue-500"
                                                    onClick={() => setEditingField(field)}
                                                >
                                                    <Icons.Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                    onClick={() => handleDelete(field.id)}
                                                    disabled={deletePending}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {editingField && (
                <EditCustomFieldDialog
                    open={!!editingField}
                    setOpen={(open) => !open && setEditingField(null)}
                    field={editingField}
                    workspaceId={workspaceId}
                />
            )}
        </>
    );
};
