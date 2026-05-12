export type UserRole = 'graduate' | 'company' | 'admin' | 'doctor';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    created_at?: string;
}

export interface AuthContextType {
    user: any; // Supabase User
    session: any; // Supabase Session
    role: UserRole | null;
    userName: string | null;
    isProfileComplete: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (email: string, password: string, userData: { name: string, role: UserRole }) => Promise<any>;
    logout: () => Promise<any>;
    deleteAccount: () => Promise<void>;
    refreshProfile: () => void;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    created_at: string;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    location: string;
    created_at: string;
    users?: { name: string };
}

export interface JobInput {
    title: string;
    description: string;
    requirements: string[];
    location: string;
}
export interface Certificate {
    id: string;
    user_id: string;
    status: 'pending' | 'ready' | 'completed' | 'rejected';
    appointment_date?: string;
    full_name: string;
    national_id: string;
    phone: string;
    college_id_number: string;
    document_urls: string[];
    rejection_reason?: string;
    payment_method: 'college' | 'online';
    delivery_method: 'pickup' | 'mail';
    created_at: string;
    users?: { name: string, email: string };
}

export interface CertificateInput {
    full_name: string;
    national_id: string;
    phone: string;
    college_id_number: string;
    document_urls: string[];
    payment_method: 'college' | 'online';
    delivery_method: 'pickup' | 'mail';
}
