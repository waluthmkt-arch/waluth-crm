
"use client";

import { useEffect, useState } from "react";
import { getCustomFields } from "@/lib/data/get-custom-fields"; // This is server action, but can be called? No, it's db call.
// We need a Server Action to fetch fields if we are inside a client component
// OR we fetch them in the parent (ListPage) and pass them down.
// BUT TaskDetails is rendered by TaskList which has access to tasks, but not necessarily fields definition.
// Let's make a Server Action wrapper or just fetch in useEffect for now (easier for prototype).

import { getCustomFieldsAction } from "@/actions/get-custom-fields-action"; // calculate name
import { CustomFieldsSection } from "./custom-fields-section";

export const CustomFieldsSectionLoader = ({ taskId, listId, workspaceId, initialValues }: any) => {
    const [fields, setFields] = useState<any[]>([]);

    useEffect(() => {
        getCustomFieldsAction(listId).then(setFields);
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
