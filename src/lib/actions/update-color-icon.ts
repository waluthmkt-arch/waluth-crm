 import { supabase } from "@/lib/supabase";

 interface UpdateColorIconInput {
   id: string;
   type: "space" | "folder" | "list";
   color: string;
   icon: string;
   workspaceId: string;
 }

 export const updateColorIcon = async ({ id, type, color, icon }: UpdateColorIconInput) => {
   const table = type === "space" ? "spaces" : type === "folder" ? "folders" : "lists";

   const { error } = await supabase
     .from(table)
     .update({ color, icon })
     .eq("id", id);

   if (error) {
     return { error: "Failed to update color/icon" };
   }

   return { success: "Color and icon updated" };
 };