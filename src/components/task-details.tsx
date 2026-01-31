
"use client";

import { useState, useTransition } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Loader2 } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateTask } from "@/actions/update-task";
import { Subtasks } from "@/components/subtasks";
import { CustomFieldsSectionLoader } from "@/components/custom-fields-section-loader";
import { CommentsLoader } from "@/components/comments-loader";


interface TaskDetailsProps {
    task: any; // Prisma type
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TaskDetails = ({
    task,
    workspaceId,
    open,
    onOpenChange
}: TaskDetailsProps) => {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(task.status || "TODO");

    // Editor for description
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write a description...',
            }),
        ],
        content: task.description || '',
        onBlur: ({ editor }) => {
            const description = editor.getHTML();
            if (description !== task.description) {
                handleUpdate({ description });
            }
        },
    });

    const handleUpdate = (data: any) => {
        startTransition(() => {
            updateTask({
                id: task.id,
                workspaceId,
                ...data
            }).then(() => {
                // Toast logic here
            });
        });
    }

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        handleUpdate({ status: newStatus });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[800px] sm:w-[500px] sm:max-w-none">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                            {task.listId} {/* Ideally show List Name here */}
                        </Badge>
                        <div className="flex items-center gap-2">
                            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[140px] h-8">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <SheetTitle className="text-2xl font-bold mt-4">
                        <input
                            defaultValue={task.name}
                            className="bg-transparent border-none outline-none w-full"
                            onBlur={(e) => {
                                if (e.target.value !== task.name) {
                                    handleUpdate({ name: e.target.value });
                                }
                            }}
                        />
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 -mx-6 h-full">
                    {/* Main Content */}
                    <div className="space-y-6 pb-20 px-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                            <div className="min-h-[200px] border rounded-md p-4 bg-gray-50 dark:bg-black/20">
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        {/* Subtasks */}
                        <div className="border-t pt-4">
                            <Subtasks
                                taskId={task.id}
                                listId={task.listId}
                                workspaceId={workspaceId}
                                existingSubtasks={task.subtasks || []}
                            />
                        </div>

                        {/* Custom Fields */}
                        <div className="border-t pt-4">
                            <CustomFieldsSectionLoader
                                taskId={task.id}
                                listId={task.listId}
                                workspaceId={workspaceId}
                                initialValues={task.customFieldValues || []}
                            />
                        </div>

                        {/* Comments (Mobile / Narrow View fallback, ideally side-by-side on wide screens) 
                             For now, let's put it at the bottom.
                         */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Comments</h3>
                            {/* We need to fetch comments. Passed in props? Or fetched via loader? 
                                Let's assume we pass them via props from getTasks (need to update getTasks).
                                OR better: A CommentsLoader similar to CustomFields.
                            */}
                            <CommentsLoader taskId={task.id} workspaceId={workspaceId} />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
