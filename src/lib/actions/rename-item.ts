 import { supabase } from "@/integrations/supabase/client";

 interface RenameItemInput {
   id: string;
   type: "workspace" | "space" | "folder" | "list" | "task";
   name: string;
   workspaceId: string;
 }

 export const renameItem = async ({ id, type, name }: RenameItemInput) => {
   const table = type === "workspace" ? "workspaces" : 
                 type === "space" ? "spaces" :
                 type === "folder" ? "folders" :
                 type === "list" ? "lists" : "tasks";

   const { error } = await supabase
     .from(table)
     .update({ name })
     .eq("id", id);

   if (error) {
     return { error: "Failed to rename item" };
   }

   return { success: "Item renamed" };
 };