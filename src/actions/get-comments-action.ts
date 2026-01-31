
"use server";

import { db } from "@/lib/db";

export const getCommentsAction = async (taskId: string) => {
    try {
        const comments = await db.comment.findMany({
            where: { taskId },
            include: { user: true },
            orderBy: { createdAt: "asc" }
        });
        return comments;
    } catch {
        return [];
    }
}
