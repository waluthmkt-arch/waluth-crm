import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getSpaces } from "@/lib/data/get-spaces";
import { NavigationRail } from "@/components/navigation-rail";
import { Sidebar } from "@/components/sidebar";

interface WorkspaceLayoutProps {
    children: React.ReactNode;
    params: { workspaceId: string };
}

export default async function WorkspaceLayout({
    children,
    params,
}: WorkspaceLayoutProps) {
    const user = await currentUser();

    if (!user || !user.id) {
        return redirect("/login");
    }

    const workspace = await db.workspace.findUnique({
        where: {
            id: params.workspaceId,
            members: {
                some: {
                    userId: user.id,
                },
            },
        },
    });

    if (!workspace) {
        return redirect("/");
    }

    const spaces = await getSpaces(params.workspaceId);

    return (
        <div className="flex h-full overflow-hidden">
            {/* 1. Navigation Rail */}
            <NavigationRail />

            {/* 2. Secondary Sidebar tree */}
            <Sidebar workspace={workspace} spaces={spaces} />

            {/* 3. Main Content */}
            <main className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#1E1E1E]">
                {children}
            </main>
        </div>
    );
}
