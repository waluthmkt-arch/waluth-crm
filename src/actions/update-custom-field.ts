"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const UpdateCustomFieldSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    type: z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "CHECKBOX", "CURRENCY", "RATING"]).optional(),
    options: z.string().optional(),
    currency: z.string().optional(),
    required: z.boolean().optional(),
    pinned: z.boolean().optional(),
    hideEmpty: z.boolean().optional(),
    visibility: z.enum(["all", "limited", "private"]).optional(),
    workspaceId: z.string(),
});

export const updateCustomField = async (values: z.infer<typeof UpdateCustomFieldSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = UpdateCustomFieldSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { id, workspaceId, ...updateData } = validatedFields.data;

    try {
        // Check if field exists and user has permission
        const existingField = await db.customField.findUnique({
            where: { id },
            include: { list: true }
        });

        if (!existingField) return { error: "Field not found" };

        // Update field
        const updatedField = await db.customField.update({
            where: { id },
            data: updateData,
        });

        revalidatePath(`/workspace/${workspaceId}/list/${existingField.listId}`);
        revalidatePath(`/workspace/${workspaceId}`);

        return { success: "Field updated!", customField: updatedField };
    } catch (error) {
        console.error("Custom Field update error:", error);
        return { error: "Failed to update field." };
    }
};
