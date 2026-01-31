"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const updateColorIcon = async ({
    id,
    type,
    color,
    icon,
    workspaceId
}: {
    id: string;
    type: "space" | "folder" | "list";
    color: string;
    icon: string;
    workspaceId: string;
}) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        if (type === "space") {
            await db.space.update({ where: { id }, data: { color, icon } });
        } else if (type === "folder") {
            await db.folder.update({ where: { id }, data: { color, icon } });
        } else {
            await db.list.update({ where: { id }, data: { color, icon } });
        }

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Updated!" };
    } catch (error) {
        return { error: "Failed to update" };
    }
};
