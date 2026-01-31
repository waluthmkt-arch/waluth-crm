"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StatusItem } from "@/lib/status-templates";

export const updateListStatuses = async ({
    listId,
    statuses,
    workspaceId
}: {
    listId: string;
    statuses: StatusItem[];
    workspaceId: string;
}) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        // Delete existing statuses for this list
        await db.status.deleteMany({
            where: { listId }
        });

        // Create new statuses
        await db.status.createMany({
            data: statuses.map((status, index) => ({
                name: status.name,
                color: status.color,
                icon: status.icon,
                category: status.category,
                order: index,
                listId
            }))
        });

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Statuses updated!" };
    } catch (error) {
        console.error("Status update error:", error);
        return { error: "Failed to update statuses" };
    }
};
