"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import * as Icons from "lucide-react";
import { POPULAR_ICONS, ICON_CATEGORIES } from "@/lib/icons";

interface ColorIconPickerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    currentColor?: string;
    currentIcon?: string;
    onConfirm: (color: string, icon: string) => Promise<any>;
}

const PRESET_COLORS = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981",
    "#06b6d4", "#6366f1", "#84cc16", "#f97316", "#14b8a6", "#a855f7",
    "#64748b", "#78716c"
];

export const ColorIconPickerDialog = ({ open, setOpen, currentColor, currentIcon, onConfirm }: ColorIconPickerDialogProps) => {
    const [selectedColor, setSelectedColor] = useState(currentColor || "#3b82f6");
    const [selectedIcon, setSelectedIcon] = useState(currentIcon || "Circle");
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        startTransition(() => {
            onConfirm(selectedColor, selectedIcon).then(() => {
                setOpen(false);
            });
        });
    };

    // Filter icons based on search
    const filteredIcons = POPULAR_ICONS.filter(icon =>
        icon.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get icon component dynamically
    const getIconComponent = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
    };

    const SelectedIconComponent = (Icons as any)[selectedIcon];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Cor e Ícone</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="icon" className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="icon">Ícone</TabsTrigger>
                        <TabsTrigger value="color">Cor</TabsTrigger>
                    </TabsList>

                    <TabsContent value="icon" className="flex-1 overflow-y-auto">
                        {/* Icon Preview */}
                        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div
                                className="w-16 h-16 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: selectedColor }}
                            >
                                {SelectedIconComponent && <SelectedIconComponent className="w-8 h-8 text-white" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Ícone selecionado</p>
                                <p className="text-xs text-gray-500">{selectedIcon}</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Pesquisar ícones..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Icon Grid */}
                        <div className="grid grid-cols-8 gap-1 max-h-[400px] overflow-y-auto p-1">
                            {(searchQuery ? filteredIcons : POPULAR_ICONS).map((iconName) => {
                                const IconComp = (Icons as any)[iconName];
                                if (!IconComp) return null;

                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setSelectedIcon(iconName)}
                                        className={`p-2 rounded hover:bg-gray-100 transition-colors ${selectedIcon === iconName ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                                            }`}
                                        title={iconName}
                                    >
                                        <IconComp className="w-5 h-5 text-gray-700" />
                                    </button>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="color" className="space-y-4">
                        {/* Color Preview */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div
                                className="w-16 h-16 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: selectedColor }}
                            >
                                {SelectedIconComponent && <SelectedIconComponent className="w-8 h-8 text-white" />}
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">Cor selecionada</label>
                                <input
                                    type="text"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                    placeholder="#3b82f6"
                                />
                            </div>
                        </div>

                        {/* Preset Colors */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Cores predefinidas</label>
                            <div className="grid grid-cols-7 gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${selectedColor === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-200'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Custom Color Picker */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Cor personalizada</label>
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="w-full h-12 rounded-md cursor-pointer"
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isPending}>
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
