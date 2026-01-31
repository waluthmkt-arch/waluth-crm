
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarItem } from "@/components/sidebar-item";
import { CreateSpaceDialog } from "@/components/create-space-dialog";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SidebarProps {
    workspace: any;
    spaces: any[];
}

export const Sidebar = ({ workspace, spaces }: SidebarProps) => {
    return (
        <aside className="w-[240px] h-screen bg-[#F7F8F9] text-gray-900 border-r border-gray-200 flex flex-col hidden md:flex flex-shrink-0">
            {/* Header / Context Switcher */}
            <div className="h-14 flex items-center px-4 border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-sm truncate">{workspace.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Free Plan</span>
                </div>
                <div className="ml-auto">
                    <div className="w-5 h-5 bg-gray-200 rounded text-gray-500 flex items-center justify-center text-xs">W</div>
                </div>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Pesquisar"
                        className="h-8 pl-8 text-xs bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Favorites */}
                <div className="px-3 mb-6">
                    <div className="flex items-center justify-between mb-1 group px-2 cursor-pointer hover:bg-gray-100 rounded py-1">
                        <span className="text-xs font-semibold text-gray-500">Favoritos</span>
                        <Plus className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                    </div>

                    {/* Show favorite spaces */}
                    {spaces.filter(s => s.isFavorite).map((space) => (
                        <div key={space.id} className="px-2 py-1 text-sm bg-gray-100/50 rounded text-gray-600 flex items-center gap-2 cursor-pointer hover:bg-gray-200 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: space.color || '#3b82f6' }}></span>
                            {space.name}
                        </div>
                    ))}

                    {spaces.filter(s => s.isFavorite).length === 0 && (
                        <div className="px-2 py-1 text-xs text-gray-400 italic">
                            Nenhum favorito ainda
                        </div>
                    )}
                </div>

                {/* Spaces */}
                <div className="px-3">
                    <div className="flex items-center justify-between mb-2 px-2 group">
                        <span className="text-xs font-semibold text-gray-500">Espaços</span>
                        <CreateSpaceDialog
                            workspaceId={workspace.id}
                            trigger={<Plus className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-700" />}
                        />
                    </div>

                    <div className="space-y-1">
                        {spaces.map((space) => (
                            <SidebarItem key={space.id} space={space} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Action */}
            <div className="p-3 border-t border-gray-200">
                <button className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    Personalizar a barra lateral
                </button>
            </div>
        </aside>
    );
};
