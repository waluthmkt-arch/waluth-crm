
"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { BoardColumn } from "@/components/board-column";

interface BoardViewProps {
    tasks: any[];
    workspaceId: string;
    listId: string;
}

const COLUMNS = [
    { id: "TODO", title: "To Do", color: "bg-gray-400" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500" },
    { id: "DONE", title: "Done", color: "bg-green-500" }
];

export const BoardView = ({ tasks, workspaceId, listId }: BoardViewProps) => {
    // Group tasks by status
    const [taskState, setTaskState] = useState(tasks);

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getTasksByStatus = (status: string) => {
        return taskState.filter((task) => (task.status || "TODO") === status);
    };


    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Determine new status
        let newStatus = "";

        // Dropping on a Column directly
        if (COLUMNS.some(col => col.id === overId)) {
            newStatus = overId;
        } else {
            // Dropping on a Task? Get that task's status
            const overTask = taskState.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status || "TODO";
            }
        }

        if (newStatus && newStatus !== (taskState.find(t => t.id === activeId)?.status || "TODO")) {
            // Optimistic Update
            setTaskState((prev) =>
                prev.map((t) =>
                    t.id === activeId ? { ...t, status: newStatus } : t
                )
            );

            // Persist update
            // (Don't block UI; we already did an optimistic update.)
            void supabase
                .from("tasks")
                .update({ status: newStatus })
                .eq("id", activeId);
        }
    };

    return (
        <div className="flex h-full overflow-x-auto p-4 gap-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                {COLUMNS.map((col) => (
                    <BoardColumn
                        key={col.id}
                        column={col}
                        tasks={getTasksByStatus(col.id)}
                    />
                ))}
            </DndContext>
        </div>
    );
};
