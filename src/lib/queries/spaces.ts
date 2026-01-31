 import { supabase } from "@/lib/supabase";

 export const getSpaces = async (workspaceId: string) => {
   const { data, error } = await supabase
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

   if (error) {
     console.error("Error fetching spaces:", error);
     return [];
   }

   return data || [];
 };