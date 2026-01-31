
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const UpdateTaskSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    workspaceId: z.string(), // Needed for revalidation
});

export const updateTask = async (values: z.infer<typeof UpdateTaskSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const { id, workspaceId, ...data } = values;

    try {
        const task = await db.task.update({
            where: { id },
            data: {
                ...data,
            },
        });

        // Revalidate the list view
        // We ideally need the listId to be more specific, but workspace level is safe enough for now
        revalidatePath(`/workspace/${workspaceId}`, "layout");

        return { success: "Task updated!", task };
    } catch (error) {
        console.error("Task update error:", error);
        return { error: "Failed to update task." };
    }
};
