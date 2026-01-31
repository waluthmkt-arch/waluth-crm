
"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface CommentsSectionProps {
    taskId: string;
    workspaceId: string;
    comments: any[];
}

export const CommentsSection = ({ taskId, workspaceId, comments }: CommentsSectionProps) => {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        if (!content.trim()) return;

        startTransition(() => {
            void (async () => {
                const { data: auth } = await supabase.auth.getUser();
                const userId = auth.user?.id;
                if (!userId) return;

                await supabase
                    .from("comments")
                    .insert({ task_id: taskId, user_id: userId, content });

                void workspaceId; // currently unused; kept for API compatibility
                setContent("");
            })();
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black/20 border-l w-[300px] flex-shrink-0">
            <div className="p-4 border-b font-medium text-sm">Activity</div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.user?.image || ""} />
                            <AvatarFallback><UserIcon className="h-3 w-3" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">{comment.user?.name || "Unknown"}</span>
                                <span className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1E1E1E] p-2 rounded-md shadow-sm border">
                                {comment.content}
                            </div>
                        </div>
                    </div>
                ))}

                {comments.length === 0 && (
                    <div className="text-xs text-center text-gray-400 py-4">No comments yet.</div>
                )}
            </div>

            <div className="p-3 border-t bg-white dark:bg-[#1E1E1E]">
                <div className="relative">
                    <textarea
                        className="w-full text-sm p-2 pr-10 border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent min-h-[40px] max-h-[100px]"
                        placeholder="Write a comment..."
                        rows={1}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 bottom-1 h-6 w-6"
                        onClick={handleSubmit}
                        disabled={isPending || !content.trim()}
                    >
                        <Send className="h-3 w-3 text-blue-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
