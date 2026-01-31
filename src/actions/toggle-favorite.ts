"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const toggleFavorite = async ({
    id,
    type,
    workspaceId
}: {
    id: string;
    type: "space" | "folder" | "list";
    workspaceId: string;
}) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        if (type === "space") {
            const item = await db.space.findUnique({ where: { id } });
            if (!item) return { error: "Not found" };
            await db.space.update({ where: { id }, data: { isFavorite: !item.isFavorite } });
        } else if (type === "folder") {
            const item = await db.folder.findUnique({ where: { id } });
            if (!item) return { error: "Not found" };
            await db.folder.update({ where: { id }, data: { isFavorite: !item.isFavorite } });
        } else {
            const item = await db.list.findUnique({ where: { id } });
            if (!item) return { error: "Not found" };
            await db.list.update({ where: { id }, data: { isFavorite: !item.isFavorite } });
        }

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Updated!" };
    } catch (error) {
        return { error: "Failed to update" };
    }
};
