 import { supabase } from "@/integrations/supabase/client";

 interface UpdateStatusesInput {
   entityId: string;
   entityType: "space" | "list";
   statuses: Array<{
     id?: string;
     name: string;
     color: string;
     icon?: string;
     category: string;
     order: number;
   }>;
   workspaceId: string;
 }

 export const updateStatuses = async ({ entityId, entityType, statuses }: UpdateStatusesInput) => {
   const columnName = entityType === "space" ? "space_id" : "list_id";

   // Delete existing statuses for this entity
   await supabase
     .from("statuses")
     .delete()
     .eq(columnName, entityId);

   // Insert new statuses
   const statusRecords = statuses.map((status) => ({
     [columnName]: entityId,
     name: status.name,
     color: status.color,
     icon: status.icon || null,
     category: status.category,
     order: status.order,
   }));

   const { error } = await supabase
     .from("statuses")
     .insert(statusRecords);

   if (error) {
     return { error: "Failed to update statuses" };
   }

   return { success: "Statuses updated" };
 };