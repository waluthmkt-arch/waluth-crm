 import { supabase } from "@/integrations/supabase/client";

 interface ToggleFavoriteInput {
   id: string;
   type: "space" | "folder" | "list";
   workspaceId: string;
 }

 export const toggleFavorite = async ({ id, type }: ToggleFavoriteInput) => {
   const table = type === "space" ? "spaces" : type === "folder" ? "folders" : "lists";

   // First get current value
   const { data: current } = await supabase
     .from(table)
     .select("is_favorite")
     .eq("id", id)
     .single();

   if (!current) {
     return { error: "Item not found" };
   }

   const { error } = await supabase
     .from(table)
     .update({ is_favorite: !current.is_favorite })
     .eq("id", id);

   if (error) {
     return { error: "Failed to toggle favorite" };
   }

   return { success: "Favorite toggled" };
 };