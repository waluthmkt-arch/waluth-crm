 import { supabase } from "@/lib/supabase";

 interface DeleteItemInput {
   id: string;
   type: "space" | "folder" | "list" | "task";
   workspaceId: string;
 }

 export const deleteItem = async ({ id, type }: DeleteItemInput) => {
   const table = type === "space" ? "spaces" :
                 type === "folder" ? "folders" :
                 type === "list" ? "lists" : "tasks";

   const { error } = await supabase
     .from(table)
     .delete()
     .eq("id", id);

   if (error) {
     return { error: "Failed to delete item" };
   }

   return { success: "Item deleted" };
 };