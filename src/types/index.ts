// Centralized types for the GTARP Dashboard

export interface User {
    id: string;
    username: string;
    avatar?: string | null;
    role: "PLAYER" | "EVALUATOR" | "ADMIN";
    isAdmin: boolean;
    createdAt?: string;
}

export interface Report {
    id: number;
    createdAt: string;
    updatedAt?: string;

    // Incident Details
    accusedId: string;
    accusedName?: string | null;
    accusedFamily?: string | null;
    reason: string;
    description?: string | null;
    evidence?: string;

    // Status
    status: "PENDING" | "INVESTIGATING" | "APPROVED" | "REJECTED";
    adminNotes?: string | null;

    // Relations
    reporterId: string;
    reporter?: Pick<User, "username" | "avatar">;
    handledBy?: string | null;
}

// Lighter type for list views
export interface ReportListItem {
    id: number;
    accusedId: string;
    accusedName?: string | null;
    reason: string;
    status: string;
    createdAt: string;
    handledBy?: string | null;
    reporter?: {
        username: string;
        avatar?: string | null;
    };
}

export interface ReportsResponse {
    reports: (Report | ReportListItem)[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface UsersResponse {
    users: User[];
}

export interface ApiError {
    error: string;
    code?: string;
}

export interface ApiSuccess<T = unknown> {
    success: true;
    message?: string;
    data?: T;
}

// Status display helpers
export const STATUS_LABELS: Record<Report["status"], string> = {
    PENDING: "Pendente",
    INVESTIGATING: "Em Análise",
    APPROVED: "Aprovada",
    REJECTED: "Rejeitada"
};

export const STATUS_COLORS: Record<Report["status"], string> = {
    PENDING: "yellow",
    INVESTIGATING: "blue",
    APPROVED: "emerald",
    REJECTED: "red"
};

export const ROLE_LABELS: Record<User["role"], string> = {
    PLAYER: "Jogador",
    EVALUATOR: "Avaliador",
    ADMIN: "Administrador"
};
