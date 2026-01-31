
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateTaskSchema = z.object({
    name: z.string().min(1, "Task name is required"),
    listId: z.string(),
    workspaceId: z.string(), // Needed for revalidation path
    parentId: z.string().optional(),
});

export const createTask = async (values: z.infer<typeof CreateTaskSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CreateTaskSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name, listId, workspaceId } = validatedFields.data;

    try {
        const list = await db.list.findUnique({
            where: { id: listId },
        });

        if (!list) return { error: "List not found" };

        const task = await db.task.create({
            data: {
                name,
                listId,
                status: "TODO", // Default status
                parentId: validatedFields.data.parentId,
            },
        });

        if (validatedFields.data.parentId) {
            revalidatePath(`/workspace/${workspaceId}`, 'layout');
        } else {
            revalidatePath(`/workspace/${workspaceId}/list/${listId}`);
        }
        return { success: "Task created!", task };
    } catch (error) {
        console.error("Task creation error:", error);
        return { error: "Failed to create task." };
    }
};
