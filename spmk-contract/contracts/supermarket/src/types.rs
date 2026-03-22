use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Role {
    Admin,
    Staff,
    Buyer,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Product {
    pub id: u64,
    pub code: String,
    pub name: String,
    pub category: String,
    pub origin: String,
    pub unit: String,
    pub cost_price: i128,
    pub price: i128,
    pub stock: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Buyer {
    pub address: Address,
    pub name: String,
    pub phone: String,
    pub total_spent: i128,
    pub purchase_count: u64,
    pub points: u64,
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PurchaseRecord {
    pub buyer: Address,
    pub product_id: u64,
    pub product_code: String,
    pub quantity: u64,
    pub total_price: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StockChange {
    pub product_id: u64,
    pub quantity: u64,
    pub is_import: bool,
    pub changed_by: Address,
    pub supplier: String,
    pub timestamp: u64,
}
