use soroban_sdk::{contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Role(Address),
    Product(u64),
    ProductByCode(String),
    ProductCount,
    ProductList,
    Buyer(Address),
    BuyerList,
    StockLog(u64),
    PurchaseLog(Address),
    TokenAddress,
}

pub const PERSISTENT_THRESHOLD: u32 = 518_400;
pub const PERSISTENT_EXTEND_TO: u32 = 535_680;
pub const INSTANCE_THRESHOLD: u32 = 518_400;
pub const INSTANCE_EXTEND_TO: u32 = 535_680;

pub fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_THRESHOLD, INSTANCE_EXTEND_TO);
}

pub fn bump_persistent(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_THRESHOLD, PERSISTENT_EXTEND_TO);
}
