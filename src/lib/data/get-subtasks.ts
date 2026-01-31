
import { db } from "@/lib/db";

export const getSubtasks = async (taskId: string) => {
    try {
        const subtasks = await db.task.findMany({
            where: {
                parentId: taskId
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        return subtasks;
    } catch {
        return [];
    }
}
