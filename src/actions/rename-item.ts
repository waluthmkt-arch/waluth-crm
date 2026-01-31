"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const renameItem = async ({
    id,
    type,
    name,
    workspaceId
}: {
    id: string;
    type: "space" | "folder" | "list";
    name: string;
    workspaceId: string;
}) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    if (!name.trim()) return { error: "Name is required" };

    try {
        if (type === "space") {
            await db.space.update({ where: { id }, data: { name } });
        } else if (type === "folder") {
            await db.folder.update({ where: { id }, data: { name } });
        } else {
            await db.list.update({ where: { id }, data: { name } });
        }

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Renamed successfully!" };
    } catch (error) {
        return { error: "Failed to rename" };
    }
};
