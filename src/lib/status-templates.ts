export const STATUS_TEMPLATES = {
    "Custom": {
        notStarted: [
            { name: "TODO", color: "#94a3b8", icon: "Circle" }
        ],
        active: [
            { name: "IN_PROGRESS", color: "#3b82f6", icon: "Circle" },
            { name: "REVIEW", color: "#8b5cf6", icon: "Circle" }
        ],
        completed: [
            { name: "DONE", color: "#10b981", icon: "CheckCircle" }
        ]
    },
    "Content": {
        notStarted: [
            { name: "Ideia", color: "#94a3b8", icon: "Lightbulb" }
        ],
        active: [
            { name: "Rascunho", color: "#f59e0b", icon: "FileEdit" },
            { name: "Em revisão", color: "#8b5cf6", icon: "Eye" },
            { name: "Aprovado", color: "#10b981", icon: "CheckCircle" }
        ],
        completed: [
            { name: "Publicado", color: "#06b6d4", icon: "Send" }
        ]
    },
    "Kanban": {
        notStarted: [
            { name: "Backlog", color: "#94a3b8", icon: "Inbox" }
        ],
        active: [
            { name: "To Do", color: "#ef4444", icon: "Circle" },
            { name: "In Progress", color: "#f59e0b", icon: "Circle" },
            { name: "Review", color: "#8b5cf6", icon: "Eye" }
        ],
        completed: [
            { name: "Done", color: "#10b981", icon: "CheckCircle" }
        ]
    },
    "Marketing": {
        notStarted: [
            { name: "Planejamento", color: "#94a3b8", icon: "Calendar" }
        ],
        active: [
            { name: "Criação", color: "#f59e0b", icon: "Palette" },
            { name: "Revisão", color: "#8b5cf6", icon: "Eye" },
            { name: "Agendado", color: "#06b6d4", icon: "Clock" }
        ],
        completed: [
            { name: "Publicado", color: "#10b981", icon: "Send" }
        ]
    },
    "Normal": {
        notStarted: [
            { name: "A fazer", color: "#94a3b8", icon: "Circle" }
        ],
        active: [
            { name: "Fazendo", color: "#3b82f6", icon: "Circle" }
        ],
        completed: [
            { name: "Concluído", color: "#10b981", icon: "CheckCircle" }
        ]
    },
    "Scrum": {
        notStarted: [
            { name: "Product Backlog", color: "#94a3b8", icon: "Inbox" }
        ],
        active: [
            { name: "Sprint Backlog", color: "#f59e0b", icon: "List" },
            { name: "In Progress", color: "#3b82f6", icon: "Zap" },
            { name: "Testing", color: "#8b5cf6", icon: "Bug" },
            { name: "Review", color: "#06b6d4", icon: "Eye" }
        ],
        completed: [
            { name: "Done", color: "#10b981", icon: "CheckCircle" }
        ]
    }
};

export type StatusCategory = "notStarted" | "active" | "completed";

export interface StatusItem {
    id?: string;
    name: string;
    color: string;
    icon?: string;
    category: StatusCategory;
    order?: number;
}
