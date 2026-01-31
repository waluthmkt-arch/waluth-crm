
"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { setCustomFieldValue } from "@/actions/set-custom-field-value";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/field-types";

interface CustomFieldsSectionProps {
    taskId: string;
    workspaceId: string;
    customFields: any[];
    fieldValues: any[];
}

export const CustomFieldsSection = ({
    taskId,
    workspaceId,
    customFields,
    fieldValues
}: CustomFieldsSectionProps) => {

    const getValue = (fieldId: string) => {
        return fieldValues.find((v) => v.fieldId === fieldId)?.value || "";
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            {customFields.map((field) => (
                <div key={field.id} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{field.name}</label>
                    <FieldValueInput
                        field={field}
                        taskId={taskId}
                        workspaceId={workspaceId}
                        initialValue={getValue(field.id)}
                    />
                </div>
            ))}
        </div>
    );
};

const FieldValueInput = ({ field, taskId, workspaceId, initialValue }: { field: any, taskId: string, workspaceId: string, initialValue: string }) => {
    const [value, setValue] = useState(initialValue);
    const [isPending, startTransition] = useTransition();

    const handleSave = (newValue: string) => {
        setValue(newValue);
        startTransition(() => {
            setCustomFieldValue({
                taskId,
                fieldId: field.id,
                value: newValue,
                workspaceId
            });
        });
    };

    // TEXT and NUMBER
    if (field.type === "TEXT" || field.type === "NUMBER") {
        return (
            <Input
                className="h-8"
                value={value}
                type={field.type === "NUMBER" ? "number" : "text"}
                onChange={(e) => setValue(e.target.value)}
                onBlur={(e) => handleSave(e.target.value)}
            />
        );
    }

    // CURRENCY
    if (field.type === "CURRENCY") {
        return (
            <div className="flex items-center gap-2">
                <Input
                    className="h-8"
                    value={value}
                    type="number"
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={(e) => handleSave(e.target.value)}
                    placeholder="0.00"
                />
                {value && (
                    <span className="text-sm text-gray-500">
                        {formatCurrency(parseFloat(value), field.currency || "BRL")}
                    </span>
                )}
            </div>
        );
    }

    // DATE
    if (field.type === "DATE") {
        const date = value ? new Date(value) : undefined;
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full h-8 justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d: Date | undefined) => handleSave(d ? d.toISOString() : "")}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        );
    }

    // CHECKBOX
    if (field.type === "CHECKBOX") {
        return (
            <div className="flex items-center h-8">
                <Checkbox
                    checked={value === "true"}
                    onCheckedChange={(checked) => handleSave(checked ? "true" : "false")}
                />
            </div>
        );
    }

    // RATING
    if (field.type === "RATING") {
        const rating = parseInt(value) || 0;
        const maxStars = 5;

        return (
            <div className="flex items-center gap-1 h-8">
                {Array.from({ length: maxStars }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => handleSave(String(i + 1))}
                        className="hover:scale-110 transition-transform"
                    >
                        <Star
                            className={cn(
                                "h-5 w-5",
                                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            )}
                        />
                    </button>
                ))}
            </div>
        );
    }

    return <div className="text-sm text-gray-400">Unsupported type</div>;
}
