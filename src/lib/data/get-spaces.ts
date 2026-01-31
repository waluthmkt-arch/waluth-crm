
import { db } from "@/lib/db";

export const getSpaces = async (workspaceId: string) => {
    try {
        const spaces = await db.space.findMany({
            where: {
                workspaceId,
            },
            include: {
                folders: {
                    include: {
                        lists: true,
                    },
                },
                lists: {
                    where: {
                        folderId: null,
                    },
                    include: {
                        statuses: {
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                statuses: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return spaces;
    } catch {
        return [];
    }
};
