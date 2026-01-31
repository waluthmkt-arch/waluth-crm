
"use client";

import {
    Home,
    Bell,
    CheckCircle2,
    Users,
    FileText,
    Search,
    Plus,
    Settings,
    HelpCircle,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const NavigationRail = () => {
    return (
        <div className="w-[60px] h-full bg-[#2B2D42] flex flex-col items-center py-4 gap-4 text-white flex-shrink-0 z-50">
            {/* Logo / Workspace Icon */}
            <div className="mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity">
                    WR
                </div>
            </div>

            {/* Main Nav Items */}
            <div className="flex flex-col gap-2 w-full px-2">
                <RailItem icon={Home} label="Início" active />
                <RailItem icon={CheckCircle2} label="Tarefas" />
                <RailItem icon={Bell} label="Notificações" />
                <RailItem icon={LayoutGrid} label="Dashboards" />
                <RailItem icon={FileText} label="Docs" />
            </div>

            <div className="mt-auto flex flex-col gap-4 w-full px-2 items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-green-500/30">
                    Invite
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-500/30">
                    ?
                </div>
                <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-white transition-all">
                    <AvatarFallback className="bg-orange-500 text-white text-xs">CS</AvatarFallback>
                </Avatar>
            </div>
        </div>
    );
};

const RailItem = ({ icon: Icon, label, active }: any) => {
    return (
        <div className={cn(
            "group relative flex flex-col items-center justify-center w-full aspect-square rounded-md cursor-pointer transition-colors",
            active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
        )}>
            <Icon className="w-5 h-5" />
            <span className="text-[9px] mt-1 opacity-0 group-hover:opacity-100 absolute -bottom-3 bg-black px-1 rounded transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {label}
            </span>
        </div>
    )
}
