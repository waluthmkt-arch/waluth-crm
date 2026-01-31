"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ColorPickerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    currentColor?: string;
    onConfirm: (color: string) => Promise<any>;
}

const PRESET_COLORS = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#ef4444", // red
    "#f59e0b", // orange
    "#10b981", // green
    "#06b6d4", // cyan
    "#6366f1", // indigo
    "#84cc16", // lime
    "#f97316", // orange-600
    "#14b8a6", // teal
    "#a855f7", // purple-500
    "#64748b", // slate
    "#78716c", // stone
];

export const ColorPickerDialog = ({ open, setOpen, currentColor, onConfirm }: ColorPickerDialogProps) => {
    const [selectedColor, setSelectedColor] = useState(currentColor || "#3b82f6");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        startTransition(() => {
            onConfirm(selectedColor).then(() => {
                setOpen(false);
            });
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Escolher Cor</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Color Preview */}
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm"
                            style={{ backgroundColor: selectedColor }}
                        />
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
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isPending}>
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
