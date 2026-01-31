
"use server";

import { db } from "@/lib/db";

export const getCustomFieldsAction = async (listId: string) => {
    try {
        const fields = await db.customField.findMany({
            where: { listId },
            orderBy: { createdAt: "asc" }
        });
        return fields;
    } catch {
        return [];
    }
}
