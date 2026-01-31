
import { db } from "@/lib/db";

export const getTasks = async (listId: string) => {
    try {
        const tasks = await db.task.findMany({
            where: {
                listId,
            },
            include: {
                assignees: {
                    include: { user: true }
                },
                subtasks: {
                    orderBy: { createdAt: 'asc' }
                },
                customFieldValues: true,
                // statuses if we decide to link them
            },
            orderBy: {
                createdAt: "desc", // Default order, later index
            },
        });

        return tasks;
    } catch {
        return [];
    }
};
