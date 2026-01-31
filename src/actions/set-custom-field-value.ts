
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const SetCustomFieldValueSchema = z.object({
    taskId: z.string(),
    fieldId: z.string(),
    value: z.string(),
    workspaceId: z.string(), // For revalidation
});

export const setCustomFieldValue = async (values: z.infer<typeof SetCustomFieldValueSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const { taskId, fieldId, value, workspaceId } = values;

    try {
        // Upsert the value
        const customFieldValue = await db.customFieldValue.upsert({
            where: {
                taskId_fieldId: {
                    taskId,
                    fieldId
                }
            },
            update: {
                value,
            },
            create: {
                taskId,
                fieldId,
                value,
            },
        });

        revalidatePath(`/workspace/${workspaceId}`, 'layout');
        return { success: "Value updated!", customFieldValue };
    } catch (error) {
        console.error("Custom Field Value error:", error);
        return { error: "Failed to update value." };
    }
};
