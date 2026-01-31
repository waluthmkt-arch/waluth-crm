"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const deleteItem = async ({
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
            await db.space.delete({ where: { id } });
        } else if (type === "folder") {
            await db.folder.delete({ where: { id } });
        } else {
            await db.list.delete({ where: { id } });
        }

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Deleted successfully!" };
    } catch (error) {
        return { error: "Failed to delete" };
    }
};
