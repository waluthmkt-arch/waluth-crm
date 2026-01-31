"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const duplicateCustomField = async ({
    id,
    workspaceId
}: {
    id: string;
    workspaceId: string;
}) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    try {
        // Get original field
        const originalField = await db.customField.findUnique({
            where: { id }
        });

        if (!originalField) return { error: "Field not found" };

        // Create duplicate
        const duplicatedField = await db.customField.create({
            data: {
                name: `${originalField.name} (cópia)`,
                description: originalField.description,
                type: originalField.type,
                options: originalField.options,
                currency: originalField.currency,
                required: originalField.required,
                pinned: originalField.pinned,
                hideEmpty: originalField.hideEmpty,
                visibility: originalField.visibility,
                listId: originalField.listId,
                createdBy: user.id,
            }
        });

        revalidatePath(`/workspace/${workspaceId}/list/${originalField.listId}`);
        revalidatePath(`/workspace/${workspaceId}`);

        return { success: "Field duplicated!", customField: duplicatedField };
    } catch (error) {
        console.error("Duplicate field error:", error);
        return { error: "Failed to duplicate field" };
    }
};
