
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateSpaceSchema = z.object({
    name: z.string().min(1, "Space name is required"),
    workspaceId: z.string(),
    color: z.string().optional(),
});

export const createSpace = async (values: z.infer<typeof CreateSpaceSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CreateSpaceSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name, workspaceId } = validatedFields.data;

    // Verify membership
    const member = await db.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: user.id,
                workspaceId,
            },
        },
    });

    if (!member) {
        return { error: "Unauthorized" };
    }

    try {
        const space = await db.space.create({
            data: {
                name,
                workspaceId,
            },
        });

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Space created!", space };
    } catch (error) {
        console.error("Space creation error:", error);
        return { error: "Failed to create space." };
    }
};
