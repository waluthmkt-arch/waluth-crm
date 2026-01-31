
import { db } from "@/lib/db";
import { getTasks } from "@/lib/data/get-tasks";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { TaskInput } from "@/components/task-input";
import { TaskList } from "@/components/task-list";
import { CustomFieldsDialog } from "@/components/custom-fields-dialog";
import { ViewSwitcher } from "@/components/view-switcher";
import { BoardView } from "@/components/board-view";
import { CalendarView } from "@/components/calendar-view";
import { TableView } from "@/components/table-view";



interface ListPageProps {
    params: {
        workspaceId: string;
        listId: string;
    };
}

export default async function ListPage({ params, searchParams }: ListPageProps & { searchParams: { view?: string } }) {
    const user = await currentUser();

    if (!user || !user.id) {
        redirect("/login");
    }

    const list = await db.list.findUnique({
        where: { id: params.listId },
        include: {
            folder: true,
            space: true,
        },
    });

    if (!list) {
        return <div>List not found</div>;
    }

    const tasks = await getTasks(params.listId);
    const view = searchParams?.view || "list";

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-14 border-b flex items-center px-6 bg-white dark:bg-[#1E1E1E]">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                        <span>{list.space?.name}</span>
                        {list.folder && (
                            <>
                                <span>/</span>
                                <span>{list.folder.name}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-lg font-semibold leading-none">{list.name}</h1>
                </div>
            </div>

            {/* Toolbar / Filters */}
            <div className="h-10 border-b flex items-center px-6 gap-4 text-sm text-muted-foreground bg-gray-50 dark:bg-[#1E1E1E]">
                <ViewSwitcher />
                <div className="ml-auto flex items-center pr-2">
                    <CustomFieldsDialog listId={list.id} workspaceId={params.workspaceId} />
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#141414] p-6">

                {view === "list" && (
                    <>
                        <div className="mb-6">
                            <TaskInput listId={list.id} workspaceId={params.workspaceId} />
                        </div>

                        {/* Table Header Row */}
                        <div className="flex items-center border-b border-gray-200 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            <div className="flex-[2] min-w-[200px] pr-2">Nome</div>
                            <div className="w-[100px] px-2 text-center">Responsável</div>
                            <div className="w-[150px] px-2">Empresa</div>
                            <div className="w-[100px] px-2">Valor Único</div>
                            <div className="w-[120px] px-2">Contato Don...</div>
                            <div className="w-[120px] px-2">Origem</div>
                            <div className="w-[120px] px-2">Nicho</div>
                            <div className="w-[80px] px-2 text-right">Data criada</div>
                            <div className="w-8"></div>
                        </div>

                        <TableView tasks={tasks} workspaceId={params.workspaceId} listId={params.listId} />
                    </>
                )}

                {view === "board" && (
                    <BoardView tasks={tasks} workspaceId={params.workspaceId} listId={params.listId} />
                )}

                {view === "calendar" && (
                    <CalendarView tasks={tasks} />
                )}
            </div>
        </div>
    );
}
