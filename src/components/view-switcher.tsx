
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export const ViewSwitcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentView = searchParams.get("view") || "list";

    const setView = (view: string) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("view", view);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center h-full">
            <div
                onClick={() => setView("list")}
                className={cn(
                    "font-medium h-full flex items-center px-4 cursor-pointer text-sm transition-colors border-b-2",
                    currentView === "list"
                        ? "text-black dark:text-white border-blue-500"
                        : "text-muted-foreground border-transparent hover:text-black dark:hover:text-white"
                )}
            >
                List
            </div>
            <div
                onClick={() => setView("board")}
                className={cn(
                    "font-medium h-full flex items-center px-4 cursor-pointer text-sm transition-colors border-b-2",
                    currentView === "board"
                        ? "text-black dark:text-white border-blue-500"
                        : "text-muted-foreground border-transparent hover:text-black dark:hover:text-white"
                )}
            >
                Board
            </div>
            <div
                onClick={() => setView("calendar")}
                className={cn(
                    "font-medium h-full flex items-center px-4 cursor-pointer text-sm transition-colors border-b-2",
                    currentView === "calendar"
                        ? "text-black dark:text-white border-blue-500"
                        : "text-muted-foreground border-transparent hover:text-black dark:hover:text-white"
                )}
            >
                Calendar
            </div>
        </div>
    );
};
