
"use client";

import { useEffect, useState } from "react";
import { getCommentsAction } from "@/actions/get-comments-action";
import { CommentsSection } from "@/components/comments-section";

export const CommentsLoader = ({ taskId, workspaceId }: any) => {
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        getCommentsAction(taskId).then(setComments);
        // Polling for real-time simulation
        const interval = setInterval(() => {
            getCommentsAction(taskId).then(setComments);
        }, 5000);

        return () => clearInterval(interval);
    }, [taskId]);

    return (
        <CommentsSection
            taskId={taskId}
            workspaceId={workspaceId}
            comments={comments}
        />
    );
};
