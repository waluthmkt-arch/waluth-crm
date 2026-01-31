import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export type FieldType = "TEXT" | "NUMBER" | "DATE" | "CURRENCY" | "SELECT" | "CHECKBOX" | "RATING";

export interface FieldTypeDefinition {
    icon: keyof typeof Icons;
    label: string;
    color: string;
    description: string;
}

export const FIELD_TYPES: Record<FieldType, FieldTypeDefinition> = {
    TEXT: {
        icon: "Type",
        label: "Texto",
        color: "#6b7280",
        description: "Campo de texto livre"
    },
    NUMBER: {
        icon: "Hash",
        label: "Número",
        color: "#3b82f6",
        description: "Valores numéricos"
    },
    DATE: {
        icon: "Calendar",
        label: "Data",
        color: "#8b5cf6",
        description: "Seletor de data"
    },
    CURRENCY: {
        icon: "DollarSign",
        label: "Dinheiro",
        color: "#10b981",
        description: "Valores monetários com moeda"
    },
    SELECT: {
        icon: "List",
        label: "Caixa de seleção",
        color: "#ec4899",
        description: "Lista de opções"
    },
    CHECKBOX: {
        icon: "CheckSquare",
        label: "Checkbox",
        color: "#f59e0b",
        description: "Verdadeiro ou falso"
    },
    RATING: {
        icon: "Star",
        label: "Avaliação",
        color: "#eab308",
        description: "Classificação por estrelas"
    }
};

export const CURRENCIES = [
    { code: "BRL", symbol: "R$", name: "Real brasileiro (R$)" },
    { code: "USD", symbol: "$", name: "Dólar americano ($)" },
    { code: "EUR", symbol: "€", name: "Euro (€)" },
    { code: "GBP", symbol: "£", name: "Libra esterlina (£)" },
    { code: "JPY", symbol: "¥", name: "Iene japonês (¥)" },
    { code: "CAD", symbol: "C$", name: "Dólar canadense (C$)" },
    { code: "AUD", symbol: "A$", name: "Dólar australiano (A$)" },
    { code: "CHF", symbol: "CHF", name: "Franco suíço (CHF)" },
    { code: "CNY", symbol: "¥", name: "Yuan chinês (¥)" },
    { code: "MXN", symbol: "$", name: "Peso mexicano ($)" },
];

export const formatCurrency = (value: number | string, currencyCode: string = "BRL"): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue)) return "-";

    const currency = CURRENCIES.find(c => c.code === currencyCode);

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currencyCode
    }).format(numValue);
};
