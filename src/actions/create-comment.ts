
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty"),
    taskId: z.string(),
    workspaceId: z.string(),
});

export const createComment = async (values: z.infer<typeof CreateCommentSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const { content, taskId, workspaceId } = values;

    try {
        const comment = await db.comment.create({
            data: {
                content,
                taskId,
                userId: user.id
            },
        });

        revalidatePath(`/workspace/${workspaceId}`, 'layout');
        return { success: "Comment added!", comment };
    } catch (error) {
        console.error("Comment creation error:", error);
        return { error: "Failed to add comment." };
    }
};
