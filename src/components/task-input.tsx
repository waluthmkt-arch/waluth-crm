
"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface TaskInputProps {
    listId: string;
    workspaceId: string;
}

export const TaskInput = ({ listId, workspaceId }: TaskInputProps) => {
    const navigate = useNavigate();
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");

    const onSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!value.trim()) {
            setIsEditing(false);
            return;
        }

        const name = value;
        setValue(""); // Optimistic clear

        startTransition(() => {
            // workspaceId is currently not needed for the tasks table; kept for API compatibility.
            void workspaceId;
            supabase
                .from("tasks")
                .insert({ name, list_id: listId })
                .then(({ error }) => {
                    if (!error) navigate(0);
                });
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            onSubmit();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setValue("");
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#252525] border border-blue-500 rounded-md shadow-sm">
                <div className="w-4 h-4 rounded-sm border-2 border-dashed border-gray-300" />
                <input
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                    placeholder="Task name..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => !value.trim() && setIsEditing(false)}
                />
                <button
                    disabled={isPending}
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        onSubmit();
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                    Save
                </button>
            </div>
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 p-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-md cursor-text transition-colors"
        >
            <Plus className="h-4 w-4" />
            <span>New Task...</span>
        </div>
    );
};
