"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const deleteCustomField = async ({
    id,
    listId,
    workspaceId
}: {
    id: string;
    listId: string;
    workspaceId: string;
}) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.customField.delete({
            where: {
                id,
                listId // Ensure it belongs to the list
            }
        });

        revalidatePath(`/workspace/${workspaceId}/list/${listId}`);
        revalidatePath(`/workspace/${workspaceId}`);

        return { success: "Field deleted!" };
    } catch (error) {
        return { error: "Failed to delete field" };
    }
};
