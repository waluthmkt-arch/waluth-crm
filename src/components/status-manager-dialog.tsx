"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, GripVertical, MoreHorizontal, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STATUS_TEMPLATES, StatusItem, StatusCategory } from "@/lib/status-templates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as Icons from "lucide-react";

interface StatusManagerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    entityId: string;
    entityType: "space" | "list";
    entityName: string;
    currentStatuses?: any[];
    onSave: (statuses: StatusItem[]) => Promise<any>;
}

export const StatusManagerDialog = ({ open, setOpen, entityId, entityType, entityName, currentStatuses = [], onSave }: StatusManagerDialogProps) => {
    const [useCustom, setUseCustom] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState("Custom");
    const [searchQuery, setSearchQuery] = useState("");

    // Transform database statuses to StatusItem format
    const initialStatuses: StatusItem[] = currentStatuses.length > 0
        ? currentStatuses.map((s: any) => ({
            name: s.name,
            color: s.color,
            icon: s.icon || "Circle",
            category: (s.category || "active") as StatusCategory
        }))
        : [
            { name: "TODO", color: "#94a3b8", icon: "Circle", category: "notStarted" },
            { name: "IN_PROGRESS", color: "#3b82f6", icon: "Circle", category: "active" },
            { name: "DONE", color: "#10b981", icon: "CheckCircle", category: "active" }
        ];

    const [statuses, setStatuses] = useState<StatusItem[]>(initialStatuses);
    const [editingStatus, setEditingStatus] = useState<{ index: number; field: 'name' | 'color' } | null>(null);

    console.log("StatusManagerDialog - currentStatuses:", currentStatuses);
    console.log("StatusManagerDialog - initialStatuses:", initialStatuses);

    const notStartedStatuses = statuses.filter(s => s.category === "notStarted");
    const activeStatuses = statuses.filter(s => s.category === "active");

    const addStatus = (category: StatusCategory) => {
        setStatuses([...statuses, {
            name: "New Status",
            color: "#94a3b8",
            icon: "Circle",
            category
        }]);
    };

    const updateStatus = (index: number, updates: Partial<StatusItem>) => {
        const newStatuses = [...statuses];
        newStatuses[index] = { ...newStatuses[index], ...updates };
        setStatuses(newStatuses);
    };

    const deleteStatus = (index: number) => {
        setStatuses(statuses.filter((_, i) => i !== index));
    };

    const applyTemplate = (templateName: string) => {
        const template = STATUS_TEMPLATES[templateName as keyof typeof STATUS_TEMPLATES];
        if (!template) return;

        const newStatuses: StatusItem[] = [
            ...template.notStarted.map(s => ({ ...s, category: "notStarted" as StatusCategory })),
            ...template.active.map(s => ({ ...s, category: "active" as StatusCategory })),
            ...(template.completed || []).map(s => ({ ...s, category: "active" as StatusCategory }))
        ];
        setStatuses(newStatuses);
        setSelectedTemplate(templateName);
    };

    const handleSave = () => {
        onSave(statuses).then(() => setOpen(false));
    };

    const filteredTemplates = Object.keys(STATUS_TEMPLATES).filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editar status de {entityName}</DialogTitle>
                </DialogHeader>

                <div className="flex gap-6 flex-1 overflow-hidden">
                    {/* Left Panel - Settings */}
                    <div className="w-80 border-r pr-6 space-y-6 overflow-y-auto">
                        {/* Status Type */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                Status type
                                <span className="text-gray-400 text-xs">ⓘ</span>
                            </Label>
                            <RadioGroup value={useCustom ? "custom" : "inherit"} onValueChange={(v) => setUseCustom(v === "custom")}>
                                <div className="flex items-center space-x-2 mb-2">
                                    <RadioGroupItem value="inherit" id="inherit" />
                                    <Label htmlFor="inherit" className="font-normal cursor-pointer">Herdar do espaço</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="custom" id="custom" />
                                    <Label htmlFor="custom" className="font-normal cursor-pointer">Usar status personalizados</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Template Selector */}
                        {useCustom && (
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">Modelo de status</Label>
                                <Select value={selectedTemplate} onValueChange={applyTemplate}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(STATUS_TEMPLATES).map(name => (
                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Template Search */}
                                <div className="mt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Pesquisar..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                                        {filteredTemplates.map(name => (
                                            <button
                                                key={name}
                                                onClick={() => applyTemplate(name)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                                            >
                                                {name}
                                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                            </button>
                                        ))}
                                    </div>
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded mt-2 flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Novo modelo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Status List */}
                    <div className="flex-1 overflow-y-auto space-y-6">
                        {/* Not Started */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    Not started
                                    <span className="text-gray-400 text-xs">ⓘ</span>
                                </Label>
                                <Button variant="ghost" size="sm" onClick={() => addStatus("notStarted")}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {notStartedStatuses.map((status, idx) => {
                                    const globalIdx = statuses.findIndex(s => s === status);
                                    return (
                                        <StatusRow
                                            key={globalIdx}
                                            status={status}
                                            onUpdate={(updates) => updateStatus(globalIdx, updates)}
                                            onDelete={() => deleteStatus(globalIdx)}
                                        />
                                    );
                                })}
                                <button
                                    onClick={() => addStatus("notStarted")}
                                    className="w-full py-2 text-sm text-gray-500 hover:bg-gray-50 rounded border-2 border-dashed border-gray-200 flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add status
                                </button>
                            </div>
                        </div>

                        {/* Active */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    Active
                                    <span className="text-gray-400 text-xs">ⓘ</span>
                                </Label>
                                <Button variant="ghost" size="sm" onClick={() => addStatus("active")}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {activeStatuses.map((status, idx) => {
                                    const globalIdx = statuses.findIndex(s => s === status);
                                    return (
                                        <StatusRow
                                            key={globalIdx}
                                            status={status}
                                            onUpdate={(updates) => updateStatus(globalIdx, updates)}
                                            onDelete={() => deleteStatus(globalIdx)}
                                        />
                                    );
                                })}
                                <button
                                    onClick={() => addStatus("active")}
                                    className="w-full py-2 text-sm text-gray-500 hover:bg-gray-50 rounded border-2 border-dashed border-gray-200 flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        Aplicar alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const StatusRow = ({ status, onUpdate, onDelete }: { status: StatusItem; onUpdate: (updates: Partial<StatusItem>) => void; onDelete: () => void }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingColor, setIsEditingColor] = useState(false);

    const IconComponent = status.icon ? (Icons as any)[status.icon] : Icons.Circle;

    return (
        <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded hover:border-gray-300 group">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />

            {/* Color Indicator */}
            <button
                onClick={() => setIsEditingColor(!isEditingColor)}
                className="relative"
            >
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: status.color }}>
                    {IconComponent && <IconComponent className="w-3 h-3 text-white" />}
                </div>
                {isEditingColor && (
                    <input
                        type="color"
                        value={status.color}
                        onChange={(e) => onUpdate({ color: e.target.value })}
                        className="absolute top-0 left-0 w-6 h-6 opacity-0 cursor-pointer"
                    />
                )}
            </button>

            {/* Name */}
            {isEditingName ? (
                <Input
                    value={status.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="flex-1 h-8"
                    autoFocus
                />
            ) : (
                <span
                    onClick={() => setIsEditingName(true)}
                    className="flex-1 text-sm cursor-pointer"
                >
                    {status.name}
                </span>
            )}

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                        Renomear
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditingColor(!isEditingColor)}>
                        Alterar a cor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        Delete Status
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
