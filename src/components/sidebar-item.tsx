
 import { useState, useEffect } from "react";
 import { Link, useNavigate } from "react-router-dom";
import {
    MoreHorizontal,
    Folder as FolderIcon,
    List as ListIcon,
    Plus,
    ChevronRight,
} from "lucide-react";

 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { CreateListDialog } from "@/components/create-list-dialog";
import { SidebarContextMenu } from "@/components/sidebar-context-menu";
import { RenameDialog } from "@/components/rename-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { ColorIconPickerDialog } from "@/components/color-icon-picker-dialog";
import { StatusManagerDialog } from "@/components/status-manager-dialog";
 import { toggleFavorite } from "@/lib/actions/toggle-favorite";
 import { renameItem } from "@/lib/actions/rename-item";
 import { deleteItem } from "@/lib/actions/delete-item";
 import { updateColorIcon } from "@/lib/actions/update-color-icon";
 import { updateStatuses } from "@/lib/actions/update-statuses";
import { CustomFieldsDialog } from "@/components/custom-fields-dialog";
import { DynamicIcon } from "@/components/dynamic-icon";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
    space: any; // Type strictly if possible, using Prisma types
}

export const SidebarItem = ({ space }: SidebarItemProps) => {
     const navigate = useNavigate();
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [createListOpen, setCreateListOpen] = useState(false);
    const [targetFolderId, setTargetFolderId] = useState<string | undefined>(undefined);

    const handleCreateListInFolder = (folderId: string) => {
        setTargetFolderId(folderId);
        setCreateListOpen(true);
    };

    const handleCreateListInSpace = () => {
        setTargetFolderId(undefined);
        setCreateListOpen(true);
    };

    // Dialog states for Space actions
    useEffect(() => {
        setOptimisticColor(space.color);
        setOptimisticIcon(space.icon);
    }, [space.color, space.icon]);

    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [statusManagerOpen, setStatusManagerOpen] = useState(false);
    const [customFieldsOpen, setCustomFieldsOpen] = useState(false);
    const [targetListForFields, setTargetListForFields] = useState<string | null>(null);

    // Handlers for Space actions
    const handleFavorite = () => {
         toggleFavorite({ id: space.id, type: "space", workspaceId: space.workspaceId })
             .then(() => window.location.reload());
    };

    const handleRename = (newName: string) => {
        return renameItem({ id: space.id, type: "space", name: newName, workspaceId: space.workspaceId })
             .then(() => window.location.reload());
    };

    const handleDelete = () => {
        return deleteItem({ id: space.id, type: "space", workspaceId: space.workspaceId })
             .then(() => navigate(-1));
    };

    // Optimistic states
    const [optimisticColor, setOptimisticColor] = useState(space.color);
    const [optimisticIcon, setOptimisticIcon] = useState(space.icon);

    const handleColorIconChange = (color: string, icon: string) => {
        setOptimisticColor(color);
        setOptimisticIcon(icon);
        return updateColorIcon({ id: space.id, type: "space", color, icon, workspaceId: space.workspaceId })
             .then(() => window.location.reload())
            .catch(() => {
                // Revert on failure
                setOptimisticColor(space.color);
                setOptimisticIcon(space.icon);
            });
    };

    const handleStatusUpdate = (statuses: any[]) => {
        return updateStatuses({ entityId: space.id, entityType: "space", statuses, workspaceId: space.workspaceId })
             .then(() => window.location.reload());
    };

    return (
        <>
            <Accordion type="single" collapsible>
                <AccordionItem value={space.id} className="border-none">
                    <div className="flex items-center group">
                        <AccordionTrigger className="hover:no-underline py-2 px-2 hover:bg-gray-800 rounded-md flex-1 text-sm">
                            <div className="flex items-center gap-2">
                                {optimisticIcon ? (
                                    <div className="w-5 h-5 rounded flex items-center justify-center transition-colors duration-200" style={{ backgroundColor: optimisticColor || '#3b82f6' }}>
                                        <DynamicIcon name={optimisticIcon} className="w-3 h-3 text-white" />
                                    </div>
                                ) : (
                                    <span className="w-2 h-2 rounded-full transition-colors duration-200" style={{ backgroundColor: optimisticColor || '#3b82f6' }} />
                                )}
                                {space.name}
                            </div>
                        </AccordionTrigger>

                        <SidebarContextMenu
                            type="space"
                            name={space.name}
                            onFavorite={handleFavorite}
                            onRename={() => setRenameOpen(true)}
                            onDelete={() => setDeleteOpen(true)}
                            onColor={() => setColorPickerOpen(true)}
                            onTaskStatuses={() => setStatusManagerOpen(true)}
                            onCreateList={handleCreateListInSpace}
                        >
                            <button className="opacity-0 group-hover:opacity-100 h-6 w-6 hover:bg-neutral-700 rounded-sm flex items-center justify-center mr-1 transition-opacity">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </SidebarContextMenu>

                        <button
                            onClick={handleCreateListInSpace}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 hover:bg-neutral-700 rounded-sm flex items-center justify-center mr-1 transition-opacity"
                        >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    <AccordionContent className="pt-0 pb-0">
                        {/* Folders */}
                        <div className="pl-4">
                            {space.folders.map((folder: any) => (
                                <FolderItem
                                    key={folder.id}
                                    folder={folder}
                                    onCreateList={() => handleCreateListInFolder(folder.id)}
                                />
                            ))}

                            {/* Direct Lists */}
                            {space.lists.map((list: any) => (
                                <div key={list.id} className="group/list relative flex items-center">
                                    <Link
                                       to={`/workspace/${space.workspaceId}/list/${list.id}`}
                                        className="flex-1 flex items-center gap-2 py-1.5 px-2 hover:bg-gray-800 rounded-md cursor-pointer text-sm text-gray-300"
                                    >
                                        <ListIcon className="h-3 w-3" />
                                        <span>{list.name}</span>
                                    </Link>

                                    <div className="absolute right-1 opacity-0 group-hover/list:opacity-100 transition-opacity">
                                        <SidebarContextMenu
                                            type="list"
                                            name={list.name}
                                            onCustomFields={() => {
                                                setTargetListForFields(list.id);
                                                setCustomFieldsOpen(true);
                                            }}
                                        >
                                            <button className="h-5 w-5 hover:bg-neutral-700 rounded-sm flex items-center justify-center">
                                                <MoreHorizontal className="h-3 w-3 text-gray-400" />
                                            </button>
                                        </SidebarContextMenu>
                                    </div>
                                </div>
                            ))}

                            {space.folders.length === 0 && space.lists.length === 0 && (
                                <div className="text-xs text-gray-500 py-2 px-2">
                                    No items inside.
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <CreateFolderDialog
                spaceId={space.id}
                open={createFolderOpen}
                setOpen={setCreateFolderOpen}
            />

            <CreateListDialog
                spaceId={space.id}
                folderId={targetFolderId}
                open={createListOpen}
                setOpen={setCreateListOpen}
            />

            <RenameDialog
                open={renameOpen}
                setOpen={setRenameOpen}
                initialName={space.name}
                onConfirm={handleRename}
            />

            <DeleteDialog
                open={deleteOpen}
                setOpen={setDeleteOpen}
                title={`Delete ${space.name}?`}
                description="This will permanently delete this space and all its contents. This action cannot be undone."
                onConfirm={handleDelete}
            />

            <ColorIconPickerDialog
                open={colorPickerOpen}
                setOpen={setColorPickerOpen}
                currentColor={space.color}
                currentIcon={space.icon}
                onConfirm={handleColorIconChange}
            />

            <StatusManagerDialog
                open={statusManagerOpen}
                setOpen={setStatusManagerOpen}
                entityId={space.id}
                entityType="space"
                entityName={space.name}
                currentStatuses={space.statuses}
                onSave={handleStatusUpdate}
            />

            {targetListForFields && (
                <CustomFieldsDialog
                    listId={targetListForFields}
                    workspaceId={space.workspaceId}
                    existingFields={space.lists.find((l: any) => l.id === targetListForFields)?.customFields || []}
                    trigger={<div />} // Hidden trigger since we control state
                />
            )}
        </>
    );
};

const FolderItem = ({ folder, onCreateList }: { folder: any, onCreateList: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <div
                className="group flex items-center justify-between py-1.5 px-2 hover:bg-gray-800 rounded-md cursor-pointer text-sm"
            >
                <div
                    className="flex items-center gap-2 flex-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronRight className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")} />
                    <FolderIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-300">{folder.name}</span>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCreateList();
                        }}
                        className="h-5 w-5 hover:bg-neutral-700 rounded-sm flex items-center justify-center"
                    >
                        <Plus className="h-3 w-3 text-gray-400" />
                    </button>
                    <SidebarContextMenu
                        type="folder"
                        name={folder.name}
                        onCreateList={onCreateList}
                    >
                        <button className="h-5 w-5 hover:bg-neutral-700 rounded-sm flex items-center justify-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-3 w-3 text-gray-400" />
                        </button>
                    </SidebarContextMenu>
                </div>
            </div>

            {isOpen && (
                <div className="pl-6 border-l border-gray-800 ml-2.5">
                    {folder.lists.map((list: any) => (
                        <div key={list.id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-800 rounded-md cursor-pointer text-sm text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span>{list.name}</span>
                        </div>
                    ))}
                    {folder.lists.length === 0 && (
                        <div className="text-xs text-gray-600 py-1">
                            No lists.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
