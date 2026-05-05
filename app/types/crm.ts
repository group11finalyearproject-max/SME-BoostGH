export interface Customer {
    id: string; // The primary unique identifier
    user_id?: string; // Links customer to the owner
    name: string;
    phone?: string;
    email?: string;
    created_at: string; // ISO DateTime
    updated_at?: string; // ISO DateTime
}
