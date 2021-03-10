export interface Code{
    id: number;
    code: string;
    event_id: string;
    username: string;
    is_active: boolean;
    claimed_date: Date;
    created_date: Date;
}
