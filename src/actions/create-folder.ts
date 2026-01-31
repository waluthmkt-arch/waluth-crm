
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateFolderSchema = z.object({
    name: z.string().min(1, "Folder name is required"),
    spaceId: z.string(),
});

export const createFolder = async (values: z.infer<typeof CreateFolderSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CreateFolderSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name, spaceId } = validatedFields.data;

    try {
        const space = await db.space.findUnique({
            where: { id: spaceId },
            include: { workspace: true },
        });

        if (!space) return { error: "Space not found" };

        // Ideally verify workspace membership here using the user ID
        // Check if user is member of space.workspace.id

        const folder = await db.folder.create({
            data: {
                name,
                spaceId,
            },
        });

        revalidatePath(`/workspace/${space.workspaceId}`);
        return { success: "Folder created!", folder };
    } catch (error) {
        console.error("Folder creation error:", error);
        return { error: "Failed to create folder." };
    }
};
