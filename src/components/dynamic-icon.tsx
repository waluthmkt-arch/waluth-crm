"use client";

import { memo } from "react";
import * as LucideIcons from "lucide-react";

interface DynamicIconProps {
    name: string;
    className?: string;
}

const DynamicIconComponent = ({ name, className }: DynamicIconProps) => {
    // 1. Validate icon name
    if (!name) return null;

    // 2. Get icon from Lucide
    // NOTE: In production, consider lazy loading or a map of used icons to avoid full bundle
    // But for "hundreds of icons" requirement, direct access is often needed given Client Component
    const Icon = (LucideIcons as any)[name];

    if (!Icon) return null;

    return <Icon className={className} />;
};

// 3. Memoize to prevent re-renders in lists/sidebar
export const DynamicIcon = memo(DynamicIconComponent);
