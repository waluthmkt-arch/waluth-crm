
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const CreateWorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
});

export const createWorkspace = async (values: z.infer<typeof CreateWorkspaceSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CreateWorkspaceSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name } = validatedFields.data;

    try {
        const workspace = await db.workspace.create({
            data: {
                name,
                ownerId: user.id,
                members: {
                    create: {
                        userId: user.id,
                        role: "OWNER",
                    },
                },
            },
        });

        return { success: "Workspace created!", workspaceId: workspace.id };
    } catch (error) {
        console.error("Workspace creation error:", error);
        return { error: "Failed to create workspace." };
    }
};
