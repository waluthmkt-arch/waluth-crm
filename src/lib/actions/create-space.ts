 import { supabase } from "@/integrations/supabase/client";

 interface CreateSpaceInput {
   name: string;
   workspaceId: string;
   color?: string;
   icon?: string;
 }

 export const createSpace = async ({ name, workspaceId, color, icon }: CreateSpaceInput) => {
   const { data: { user } } = await supabase.auth.getUser();
   
   if (!user) {
     return { error: "Not authenticated" };
   }

   const { error } = await supabase
     .from("spaces")
     .insert({
       name,
       workspace_id: workspaceId,
       color: color || "#3b82f6",
       icon: icon || null,
     });

   if (error) {
     console.error("Error creating space:", error);
     return { error: "Failed to create space" };
   }

   return { success: "Space created successfully!" };
 };