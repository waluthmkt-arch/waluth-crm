
"use client";

import { useEffect, useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
import { CommentsSection } from "@/components/comments-section";

export const CommentsLoader = ({ taskId, workspaceId }: any) => {
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        let cancelled = false;

        const fetchComments = async () => {
            const { data } = await supabase
                .from("comments")
                .select("*, user:profiles(id,name,image)")
                .eq("task_id", taskId)
                .order("created_at", { ascending: true });

            if (!cancelled) setComments(data || []);
        };

        void fetchComments();

        // Polling for real-time simulation
        const interval = setInterval(() => {
            void fetchComments();
        }, 5000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [taskId]);

    return (
        <CommentsSection
            taskId={taskId}
            workspaceId={workspaceId}
            comments={comments}
        />
    );
};
