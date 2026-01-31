
"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Star,
    Pencil,
    Link,
    Plus,
    Palette,
    LayoutTemplate,
    Zap,
    Puzzle,
    Tags,
    MoreHorizontal,
    EyeOff,
    Copy,
    Archive,
    Trash,
    Lock,
    ListTodo
} from "lucide-react";
import { ReactNode } from "react";

interface SidebarContextMenuProps {
    children: ReactNode;
    type: "space" | "folder" | "list";
    name: string;
    onRename?: () => void;
    onDelete?: () => void;
    onColor?: () => void;
    onCreateList?: () => void;
    onFavorite?: () => void;
    onTaskStatuses?: () => void;
    onCustomFields?: () => void;
}

export const SidebarContextMenu = ({
    children,
    type,
    name,
    onRename,
    onDelete,
    onColor,
    onCreateList,
    onFavorite,
    onTaskStatuses,
    onCustomFields
}: SidebarContextMenuProps) => {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start" side="right" sideOffset={5}>
                {/* Main Actions */}
                <DropdownMenuItem onClick={onFavorite}>
                    <Star className="h-4 w-4 mr-2" />
                    Favorite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRename}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link className="h-4 w-4 mr-2" />
                    Copy link
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Configurations */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Plus className="h-4 w-4 mr-2" />
                        Create new
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={onCreateList}>List</DropdownMenuItem>
                        <DropdownMenuItem>Doc</DropdownMenuItem>
                        <DropdownMenuItem>Folder</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={onColor}>
                    <Palette className="h-4 w-4 mr-2" />
                    Color & Icon
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Templates
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Zap className="h-4 w-4 mr-2" />
                    Automations
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Puzzle className="h-4 w-4 mr-2" />
                    ClickApps
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCustomFields}>
                    <Tags className="h-4 w-4 mr-2" />
                    Custom Fields
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTaskStatuses}>
                    <ListTodo className="h-4 w-4 mr-2" />
                    Task Statuses
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Tags className="h-4 w-4 mr-2" />
                    Tags
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    More
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide {type}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <Lock className="h-4 w-4 mr-2" />
                    Sharing & Permissions
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};
