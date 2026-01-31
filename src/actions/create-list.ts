
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateListSchema = z.object({
    name: z.string().min(1, "List name is required"),
    spaceId: z.string(),
    folderId: z.string().optional(),
});

export const createList = async (values: z.infer<typeof CreateListSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CreateListSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name, spaceId, folderId } = validatedFields.data;

    try {
        const space = await db.space.findUnique({
            where: { id: spaceId },
            include: { workspace: true }
        });

        if (!space) return { error: "Space not found" };

        const list = await db.list.create({
            data: {
                name,
                spaceId,
                folderId,
            },
        });

        revalidatePath(`/workspace/${space.workspaceId}`);
        return { success: "List created!", list };
    } catch (error) {
        console.error("List creation error:", error);
        return { error: "Failed to create list." };
    }
};
