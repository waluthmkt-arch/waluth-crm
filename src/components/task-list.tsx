
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TaskDetails } from "@/components/task-details";

interface TaskListProps {
    tasks: any[];
    workspaceId: string;
    listId: string;
}

export const TaskList = ({ tasks, workspaceId, listId }: TaskListProps) => {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [open, setOpen] = useState(false);

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
        setOpen(true);
    };

    return (
        <>
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-300 dark:bg-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase text-gray-700 dark:text-gray-300">
                        To Do
                    </span>
                    <span className="text-xs text-muted-foreground">{tasks.length}</span>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {tasks.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No tasks here yet. Create one above!
                        </div>
                    )}
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className="group flex items-center gap-3 p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors cursor-pointer"
                        >
                            <div
                                className="w-4 h-4 rounded-sm border-2 border-gray-300 hover:border-blue-500 cursor-pointer flex items-center justify-center group-hover:border-blue-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle check to complete
                                }}
                            />
                            <div className="flex-1 flex flex-col">
                                <span className="text-sm font-medium">{task.name}</span>
                            </div>

                            {task.status && task.status !== "TODO" && (
                                <Badge variant="outline" className="text-[10px] h-5">
                                    {task.status}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    workspaceId={workspaceId}
                    open={open}
                    onOpenChange={(isOpen) => {
                        setOpen(isOpen);
                        if (!isOpen) setSelectedTask(null);
                    }}
                />
            )}
        </>
    );
};
