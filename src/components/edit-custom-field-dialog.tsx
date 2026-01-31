"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FIELD_TYPES, CURRENCIES, FieldType } from "@/lib/field-types";
import { updateCustomField } from "@/actions/update-custom-field";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import * as Icons from "lucide-react";

interface EditCustomFieldDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    field: any;
    workspaceId: string;
}

export const EditCustomFieldDialog = ({ open, setOpen, field, workspaceId }: EditCustomFieldDialogProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    // Form state
    const [name, setName] = useState(field.name);
    const [description, setDescription] = useState(field.description || "");
    const [type, setType] = useState<FieldType>(field.type);
    const [currency, setCurrency] = useState(field.currency || "BRL");
    const [required, setRequired] = useState(field.required || false);
    const [pinned, setPinned] = useState(field.pinned || false);
    const [hideEmpty, setHideEmpty] = useState(field.hideEmpty || false);
    const [visibility, setVisibility] = useState(field.visibility || "all");

    const handleSave = () => {
        setError("");
        setSuccess("");

        startTransition(() => {
            updateCustomField({
                id: field.id,
                name,
                description,
                type,
                currency: type === "CURRENCY" ? currency : undefined,
                required,
                pinned,
                hideEmpty,
                visibility: visibility as "all" | "limited" | "private",
                workspaceId
            }).then((data) => {
                if (data?.error) {
                    setError(data.error);
                } else if (data?.success) {
                    setSuccess(data.success);
                    router.refresh();
                    setTimeout(() => setOpen(false), 1000);
                }
            }).catch(() => setError("Something went wrong!"));
        });
    };

    const fieldTypeInfo = FIELD_TYPES[type];
    const IconComponent = fieldTypeInfo ? (Icons as any)[fieldTypeInfo.icon] : Icons.Circle;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar campo</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Geral Section */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Geral</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Nome do campo *</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: fieldTypeInfo?.color }}>
                                        {IconComponent && <IconComponent className="w-4 h-4 text-white" />}
                                    </div>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nome do campo"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Descrição <span className="text-gray-400">(opcional)</span></Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Passe o cursor sobre os campos nas tarefas ou visualizações para ver a descrição deles"
                                    className="mt-2 resize-none"
                                    rows={3}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Tipo de campo Section */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Tipo de campo</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Tipo</Label>
                                <Select value={type} onValueChange={(v) => setType(v as FieldType)} disabled={isPending}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(FIELD_TYPES).map(([key, info]) => {
                                            const Icon = (Icons as any)[info.icon];
                                            return (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: info.color }}>
                                                            {Icon && <Icon className="w-3 h-3 text-white" />}
                                                        </div>
                                                        {info.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Currency-specific options */}
                            {type === "CURRENCY" && (
                                <div>
                                    <Label>Moeda</Label>
                                    <Select value={currency} onValueChange={setCurrency} disabled={isPending}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((curr) => (
                                                <SelectItem key={curr.code} value={curr.code}>
                                                    {curr.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label>Default value</Label>
                                <Input
                                    placeholder="-"
                                    className="mt-2"
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Localizações Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold">Localizações</h3>
                            <Button variant="ghost" size="sm" disabled={isPending}>
                                + Adicionar
                            </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                            Total de {field.list ? 1 : 0}
                        </div>
                    </div>

                    <Separator />

                    {/* Configurações Section */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Configurações</h3>
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Label className="font-normal">Obrigatório em tarefas</Label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Campos personalizados obrigatórios devem ser preenchidos ao criar tarefas em todas as localizações em que o campo personalizado for usado em seu Espaço de trabalho.
                                    </p>
                                </div>
                                <Switch
                                    checked={required}
                                    onCheckedChange={setRequired}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Label className="font-normal">Fixado</Label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Os campos personalizados fixados sempre serão exibidos na visualização de Tarefa, mesmo que estejam vazios.
                                    </p>
                                </div>
                                <Switch
                                    checked={pinned}
                                    onCheckedChange={setPinned}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Label className="font-normal">Visível para convidados e membros limitados</Label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Os campos personalizados podem ser ocultados ou mostrados aos membros limitados no seu Espaço de trabalho.
                                    </p>
                                </div>
                                <Switch
                                    checked={visibility === "all"}
                                    onCheckedChange={(checked) => setVisibility(checked ? "all" : "limited")}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Permissões Section */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Permissões</h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm text-gray-600">Permissões básicas</Label>
                                <p className="text-xs text-gray-500 mt-1 mb-3">
                                    Defina o nível de permissão padrão para todos no espaço de trabalho.
                                </p>
                                <Select value={visibility} onValueChange={setVisibility} disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <div className="flex items-center gap-2">
                                                <Icons.Users className="w-4 h-4" />
                                                Padrão
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="limited">Limitado</SelectItem>
                                        <SelectItem value="private">Privado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button variant="outline" className="w-full" disabled={isPending}>
                                <Icons.Lock className="w-4 h-4 mr-2" />
                                Tornar privado
                            </Button>
                        </div>
                    </div>

                    <FormError message={error} />
                    <FormSuccess message={success} />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
