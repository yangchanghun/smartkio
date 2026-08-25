export type Category = { id: number; name: string };
export type Product = { id: number; name: string; price: number; category: number; category_name: string; is_available: boolean };
export type Order = { id: number; total_amount: number; status: string; created_at: string; items: { name: string; quantity: number }[] };
