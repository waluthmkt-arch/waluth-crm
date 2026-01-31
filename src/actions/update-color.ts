"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const updateColor = async ({
    id,
    type,
    color,
    workspaceId
}: {
    id: string;
    type: "space" | "folder" | "list";
    color: string;
    workspaceId: string;
}) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        if (type === "space") {
            await db.space.update({ where: { id }, data: { color } });
        } else if (type === "folder") {
            await db.folder.update({ where: { id }, data: { color } });
        } else {
            await db.list.update({ where: { id }, data: { color } });
        }

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Color updated!" };
    } catch (error) {
        return { error: "Failed to update color" };
    }
};
