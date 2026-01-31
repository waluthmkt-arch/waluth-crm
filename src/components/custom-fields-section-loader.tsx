
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CustomFieldsSection } from "./custom-fields-section";

export const CustomFieldsSectionLoader = ({ taskId, listId, workspaceId, initialValues }: any) => {
    const [fields, setFields] = useState<any[]>([]);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const { data } = await supabase
                .from("custom_fields")
                .select("*")
                .eq("list_id", listId)
                .order("created_at", { ascending: false });

            if (!cancelled) setFields(data || []);
        })();

        return () => {
            cancelled = true;
        };
    }, [listId]);

    if (fields.length === 0) return null;

    return (
        <CustomFieldsSection
            taskId={taskId}
            workspaceId={workspaceId}
            customFields={fields}
            fieldValues={initialValues}
        />
    );
}
