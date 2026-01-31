"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StatusItem } from "@/lib/status-templates";

export const updateStatuses = async ({
    entityId,
    entityType,
    statuses,
    workspaceId
}: {
    entityId: string;
    entityType: "space" | "list";
    statuses: StatusItem[];
    workspaceId: string;
}) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        console.log("updateStatuses - Received:", { entityId, entityType, statuses, workspaceId });

        // Delete existing statuses for this entity
        if (entityType === "space") {
            await db.status.deleteMany({ where: { spaceId: entityId } });
        } else {
            await db.status.deleteMany({ where: { listId: entityId } });
        }

        // Create new statuses
        const created = await db.status.createMany({
            data: statuses.map((status, index) => ({
                name: status.name,
                color: status.color,
                icon: status.icon,
                category: status.category,
                order: index,
                spaceId: entityType === "space" ? entityId : undefined,
                listId: entityType === "list" ? entityId : undefined,
            }))
        });

        console.log("updateStatuses - Created:", created);

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Statuses updated!" };
    } catch (error) {
        console.error("Status update error:", error);
        return { error: "Failed to update statuses" };
    }
};
