
"use client";

import { useState, useTransition } from "react";
import { Plus, ChevronRight, Circle } from "lucide-react";
import { createTask } from "@/actions/create-task";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SubtasksProps {
    taskId: string;
    listId: string;
    workspaceId: string;
    existingSubtasks: any[];
}

export const Subtasks = ({ taskId, listId, workspaceId, existingSubtasks }: SubtasksProps) => {
    const [subtasks, setSubtasks] = useState(existingSubtasks);
    const [isCreating, setIsCreating] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleCreate = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) {
            setIsCreating(false);
            return;
        }

        const name = inputValue;
        setInputValue("");

        // Optimistic update (simplified)
        const tempId = Math.random().toString();
        setSubtasks([...subtasks, { id: tempId, name, status: "TODO" }]);

        startTransition(() => {
            createTask({
                name,
                listId,
                workspaceId,
                parentId: taskId
            }).then((data) => {
                if (data?.task) {
                    // Replace temp task with real one
                    setSubtasks(prev => prev.map(t => t.id === tempId ? data.task : t));
                }
            });
        });

        // Keep input open for rapid entry
        // setIsCreating(false); 
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Subtasks ({subtasks.length})</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
                >
                    <Plus className="h-4 w-4 text-gray-500" />
                </button>
            </div>

            <div className="space-y-1">
                {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-black/20 rounded-md text-sm group">
                        <div className="w-3 h-3 rounded-full border border-gray-400 group-hover:border-blue-500 cursor-pointer" />
                        <span className={cn("flex-1", subtask.id.includes(".") && "opacity-50")}>{subtask.name}</span>
                        <Badge variant="outline" className="text-[10px] scale-90 opacity-0 group-hover:opacity-100 transition-opacity">
                            {subtask.status || "TODO"}
                        </Badge>
                    </div>
                ))}
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="mt-2 flex items-center gap-2 p-2 border rounded-md">
                    <div className="w-3 h-3 rounded-full border border-dashed border-gray-400" />
                    <input
                        autoFocus
                        className="flex-1 bg-transparent text-sm outline-none"
                        placeholder="Subtask name..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={() => !inputValue && setIsCreating(false)}
                    />
                </form>
            )}

            {!isCreating && subtasks.length === 0 && (
                <div
                    onClick={() => setIsCreating(true)}
                    className="text-xs text-gray-400 p-2 cursor-pointer hover:text-gray-600 italic"
                >
                    Click to add a subtask...
                </div>
            )}
        </div>
    );
};
