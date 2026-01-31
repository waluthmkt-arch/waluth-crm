
"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    Users,
    Calendar,
    MoreHorizontal,
    Plus,
    Tag,
    DollarSign,
    Hash,
    CheckCircle2,
    XCircle,
    Circle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskDetails } from "@/components/task-details"; // Reusing detailed view
import { useState } from "react";

interface TableViewProps {
    tasks: any[];
    workspaceId: string;
    listId: string;
}

const statusColors: Record<string, string> = {
    "TODO": "bg-gray-400",
    "IN_PROGRESS": "bg-blue-500",
    "DONE": "bg-green-500",
    "CLOSED": "bg-green-700",
    "LOST": "bg-red-600"
};

export const TableView = ({ tasks, workspaceId, listId }: TableViewProps) => {

    // Group tasks by status
    const groupedTasks = tasks.reduce((groups: any, task) => {
        const status = task.status || "TODO";
        if (!groups[status]) groups[status] = [];
        groups[status].push(task);
        return groups;
    }, {});

    // Order of statuses to display
    const statusOrder = ["TODO", "IN_PROGRESS", "DONE", "CLOSED", "LOST"];

    return (
        <div className="w-full pb-20">
            {statusOrder.map((status) => {
                const groupTasks = groupedTasks[status] || [];
                // Only show group if it has tasks or if it's a "standard" status (optional logic)
                if (groupTasks.length === 0) return null;

                return (
                    <div key={status} className="mb-6">
                        {/* Group Header */}
                        <div className={`flex items-center gap-2 px-4 py-2 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-gray-100`}>
                            <Badge className={`${statusColors[status] || "bg-gray-400"} hover:${statusColors[status]} text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-bold`}>
                                {status.replace("_", " ")}
                            </Badge>
                            <span className="text-gray-400 text-xs font-semibold">{groupTasks.length}</span>
                            <div className="flex-1 border-t border-gray-100 ml-2"></div>
                            <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>

                        {/* Column Headers (Show only once? Or per group? ClickUp shows per group usually just implicitly aligned, but let's add a main header at page top actually.
                             For now, let's make a "Table Row" for each task.
                         */}

                        {groupTasks.map((task: any) => (
                            <TaskRow key={task.id} task={task} workspaceId={workspaceId} />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

const TaskRow = ({ task, workspaceId }: { task: any, workspaceId: string }) => {
    const [open, setOpen] = useState(false);

    // Helpers to get custom field values safely
    const getValue = (type: string) => {
        const val = task.customFieldValues?.find((v: any) => v.field?.type === type)?.value;
        return val;
    };

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="group flex items-center border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer text-sm py-1.5 px-4"
            >
                {/* Name Column */}
                <div className="flex-[2] flex items-center gap-2 min-w-[200px] border-r border-transparent group-hover:border-gray-100 pr-2">
                    <div className="w-4 flex justify-center">
                        <CheckCircle2 className={`w-3 h-3 ${task.status === "DONE" ? "text-green-500" : "text-gray-300 hover:text-gray-400"}`} />
                    </div>
                    <span className="truncate text-gray-700 group-hover:text-blue-600">{task.name}</span>
                </div>

                {/* Assignee */}
                <div className="w-[100px] flex items-center justify-center border-r border-transparent group-hover:border-gray-100 px-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">WR</div>
                </div>

                {/* Company (Custom Field example) */}
                <div className="w-[150px] truncate text-gray-500 border-r border-transparent group-hover:border-gray-100 px-2 text-xs">
                    {getValue("TEXT") || "-"}
                </div>

                {/* Value (Custom Field example) */}
                <div className="w-[100px] truncate text-gray-500 border-r border-transparent group-hover:border-gray-100 px-2 text-xs">
                    {getValue("NUMBER") ? `R$${getValue("NUMBER")}` : "-"}
                </div>

                {/* Contact (Custom Field example) */}
                <div className="w-[120px] truncate text-gray-500 border-r border-transparent group-hover:border-gray-100 px-2 text-xs">
                    -
                </div>

                {/* Origin (Select example) */}
                <div className="w-[120px] flex items-center border-r border-transparent group-hover:border-gray-100 px-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-sm font-normal text-[10px]">
                        Ralf SDR
                    </Badge>
                </div>

                {/* Niche (Select example) */}
                <div className="w-[120px] flex items-center border-r border-transparent group-hover:border-gray-100 px-2">
                    {/* Placeholder badge */}
                </div>

                {/* Date Created */}
                <div className="w-[80px] text-gray-400 text-[10px] text-right px-2">
                    {format(new Date(task.createdAt), "MMM d")}
                </div>

                <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            <TaskDetails
                task={task}
                workspaceId={workspaceId}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    )
}
