
"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateCustomFieldSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    type: z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "CHECKBOX", "CURRENCY", "RATING"]),
    listId: z.string(),
    workspaceId: z.string(),
    options: z.string().optional(),
    currency: z.string().optional(),
    required: z.boolean().optional(),
    pinned: z.boolean().optional(),
    hideEmpty: z.boolean().optional(),
    visibility: z.enum(["all", "limited", "private"]).optional(),
});

export const createCustomField = async (values: z.infer<typeof CreateCustomFieldSchema>) => {
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CreateCustomFieldSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name, description, type, listId, workspaceId, options, currency, required, pinned, hideEmpty, visibility } = validatedFields.data;

    try {
        const list = await db.list.findUnique({
            where: { id: listId },
        });

        if (!list) return { error: "List not found" };

        const customField = await db.customField.create({
            data: {
                name,
                description,
                type,
                listId,
                options,
                currency,
                required: required || false,
                pinned: pinned || false,
                hideEmpty: hideEmpty || false,
                visibility: visibility || "all",
                createdBy: user.id,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/list/${listId}`);
        revalidatePath(`/workspace/${workspaceId}`);
        return { success: "Field created!", customField };
    } catch (error) {
        console.error("Custom Field creation error:", error);
        return { error: "Failed to create field." };
    }
};
