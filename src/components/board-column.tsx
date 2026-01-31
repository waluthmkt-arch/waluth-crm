
"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export const BoardColumn = ({ column, tasks }: { column: any, tasks: any[] }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <div className="w-72 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${column.color}`} />
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{column.title}</span>
                <span className="text-xs text-gray-500">{tasks.length}</span>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 bg-gray-50 dark:bg-black/20 rounded-lg p-2 space-y-2 border border-dashed border-gray-200 dark:border-gray-800 min-h-[500px]"
            >
                {tasks.map((task) => (
                    <Packet key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
};

const Packet = ({ task }: { task: any }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-white dark:bg-[#1E1E1E] p-3 rounded shadow-sm border text-sm cursor-grab active:cursor-grabbing hover:border-blue-500 select-none z-10 relative"
        >
            <div className="flex flex-col gap-1">
                <span className="font-medium">{task.name}</span>
                {/* Basic badges or info can go here */}
            </div>
        </div>
    )
}
