 import { useEffect, useState } from "react";
 import { useParams, useNavigate, useLocation } from "react-router-dom";
 import { supabase } from "@/lib/supabase";
 import { useAuth } from "@/hooks/useAuth";
 import { NavigationRail } from "@/components/navigation-rail";
 import { Sidebar } from "@/components/sidebar";
 import { ViewSwitcher } from "@/components/view-switcher";
 import { BoardView } from "@/components/board-view";
 import { CalendarView } from "@/components/calendar-view";
 import { TaskInput } from "@/components/task-input";
 import { TaskDetails } from "@/components/task-details";
 import { MoreHorizontal } from "lucide-react";
 
 export default function WorkspacePage() {
   const { workspaceId, listId } = useParams();
   const navigate = useNavigate();
   const location = useLocation();
   const { user } = useAuth();
   const [workspace, setWorkspace] = useState<any>(null);
   const [spaces, setSpaces] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [list, setList] = useState<any>(null);
   const [tasks, setTasks] = useState<any[]>([]);
   const [selectedTask, setSelectedTask] = useState<any>(null);
 
   useEffect(() => {
     const fetchWorkspaceData = async () => {
       if (!user || !workspaceId) {
         navigate("/");
         return;
       }
 
       const { data: workspaceData, error: workspaceError } = await supabase
         .from("workspaces")
         .select("*")
         .eq("id", workspaceId)
         .maybeSingle();
 
       if (workspaceError || !workspaceData) {
         navigate("/");
         return;
       }
 
       setWorkspace(workspaceData);
 
       const { data: spacesData } = await supabase
         .from("spaces")
         .select(`
           *,
           folders:folders(*,
             lists:lists(*)
           ),
           lists:lists!lists_space_id_fkey(*),
           statuses:statuses!statuses_space_id_fkey(*)
         `)
         .eq("workspace_id", workspaceId)
         .order("created_at", { ascending: false });
 
       setSpaces(spacesData || []);
       setLoading(false);
     };
 
     fetchWorkspaceData();
   }, [user, workspaceId, navigate]);
 
   useEffect(() => {
     if (!listId) {
       setList(null);
       setTasks([]);
       return;
     }
 
     const fetchListData = async () => {
       const { data: listData } = await supabase
         .from("lists")
         .select("*")
         .eq("id", listId)
         .maybeSingle();
 
       if (listData) {
         setList(listData);
       }
 
       const { data: tasksData } = await supabase
         .from("tasks")
         .select(`
           *,
           assignees:task_assignees(user:profiles(*)),
           subtasks:tasks!tasks_parent_id_fkey(*),
           customFieldValues:custom_field_values(*)
         `)
         .eq("list_id", listId)
         .is("parent_id", null)
         .order("created_at", { ascending: false });
 
       setTasks(tasksData || []);
     };
 
     fetchListData();
   }, [listId]);
 
   if (loading) {
     return (
       <div className="flex h-screen items-center justify-center">
         <p className="text-muted-foreground">Loading workspace...</p>
       </div>
     );
   }
 
   const searchParams = new URLSearchParams(location.search);
   const currentView = searchParams.get("view") || "list";
 
   return (
     <div className="flex h-screen overflow-hidden">
       <NavigationRail />
       <Sidebar workspace={workspace} spaces={spaces} />
       <main className="flex-1 h-full flex flex-col overflow-hidden bg-white dark:bg-[#1E1E1E]">
         {listId && list ? (
           <>
             <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
               <div className="flex items-center gap-3">
                 <h1 className="text-lg font-semibold">{list.name}</h1>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <span>{tasks.length} tasks</span>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button className="h-8 w-8 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                   <MoreHorizontal className="h-4 w-4" />
                 </button>
               </div>
             </div>
 
             <div className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 justify-between">
               <ViewSwitcher />
               <TaskInput listId={listId} workspaceId={workspaceId!} />
             </div>
 
             <div className="flex-1 overflow-hidden">
               {currentView === "list" && (
                 <div className="h-full overflow-y-auto">
                   <div className="p-6">
                     {tasks.map((task) => (
                       <div
                         key={task.id}
                         onClick={() => setSelectedTask(task)}
                         className="p-3 border rounded mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                       >
                         <div className="font-medium">{task.name}</div>
                         {task.description && (
                           <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                             {task.description.replace(/<[^>]*>/g, '')}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               {currentView === "board" && (
                 <BoardView tasks={tasks} workspaceId={workspaceId!} listId={listId!} />
               )}
               {currentView === "calendar" && (
                 <CalendarView tasks={tasks} />
               )}
             </div>
 
             {selectedTask && (
               <TaskDetails
                 task={selectedTask}
                 workspaceId={workspaceId!}
                 open={!!selectedTask}
                 onOpenChange={(open) => !open && setSelectedTask(null)}
               />
             )}
           </>
         ) : (
           <div className="flex-1 flex items-center justify-center">
             <div className="text-center">
               <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
               <p className="text-muted-foreground mt-2">Select a list from the sidebar to get started.</p>
             </div>
           </div>
         )}
       </main>
     </div>
   );
 }