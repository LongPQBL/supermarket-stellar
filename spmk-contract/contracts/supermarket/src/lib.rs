#![no_std]

mod auth;
mod errors;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env, String, Vec};

use auth::{require_admin, require_staff_or_admin};
use errors::Error;
use storage::{bump_instance, bump_persistent, DataKey};
use types::{Buyer, Product, PurchaseRecord, Role, StockChange};

#[contract]
pub struct SupermarketContract;

#[contractimpl]
impl SupermarketContract {
    // ─── Initialization ───

    pub fn initialize(env: Env, admin: Address, token_address: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenAddress, &token_address);
        env.storage()
            .instance()
            .set(&DataKey::Role(admin.clone()), &Role::Admin);
        env.storage().instance().set(&DataKey::ProductCount, &0u64);
        let empty_list: Vec<u64> = Vec::new(&env);
        env.storage()
            .instance()
            .set(&DataKey::ProductList, &empty_list);

        bump_instance(&env);

        env.events()
            .publish((symbol_short!("init"),), admin.clone());

        Ok(())
    }

    // ─── Role Management ───

    pub fn set_role(
        env: Env,
        admin: Address,
        account: Address,
        role: Role,
    ) -> Result<(), Error> {
        require_admin(&env, &admin)?;

        env.storage()
            .instance()
            .set(&DataKey::Role(account.clone()), &role);
        bump_instance(&env);

        env.events()
            .publish((symbol_short!("role"), symbol_short!("set")), account);

        Ok(())
    }

    pub fn get_role(env: Env, account: Address) -> Option<Role> {
        env.storage()
            .instance()
            .get(&DataKey::Role(account))
    }

    pub fn remove_role(env: Env, admin: Address, account: Address) -> Result<(), Error> {
        require_admin(&env, &admin)?;

        env.storage()
            .instance()
            .remove(&DataKey::Role(account.clone()));
        bump_instance(&env);

        env.events()
            .publish((symbol_short!("role"), symbol_short!("rm")), account);

        Ok(())
    }

    // ─── Product CRUD (Admin Only) ───

    pub fn add_product(
        env: Env,
        admin: Address,
        code: String,
        name: String,
        category: String,
        origin: String,
        unit: String,
        cost_price: i128,
        price: i128,
    ) -> Result<u64, Error> {
        require_admin(&env, &admin)?;

        if price <= 0 || cost_price <= 0 {
            return Err(Error::InvalidPrice);
        }

        let code_key = DataKey::ProductByCode(code.clone());
        if env.storage().persistent().has(&code_key) {
            return Err(Error::DuplicateCode);
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ProductCount)
            .unwrap_or(0);
        count += 1;

        let product = Product {
            id: count,
            code: code.clone(),
            name,
            category,
            origin,
            unit,
            cost_price,
            price,
            stock: 0,
            is_active: true,
        };

        let product_key = DataKey::Product(count);
        env.storage().persistent().set(&product_key, &product);
        bump_persistent(&env, &product_key);

        env.storage().persistent().set(&code_key, &count);
        bump_persistent(&env, &code_key);

        env.storage().instance().set(&DataKey::ProductCount, &count);

        let mut list: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ProductList)
            .unwrap_or(Vec::new(&env));
        list.push_back(count);
        env.storage().instance().set(&DataKey::ProductList, &list);

        bump_instance(&env);

        env.events()
            .publish((symbol_short!("product"), symbol_short!("add")), count);

        Ok(count)
    }

    pub fn update_product(
        env: Env,
        admin: Address,
        product_id: u64,
        code: String,
        name: String,
        category: String,
        origin: String,
        unit: String,
        cost_price: i128,
        price: i128,
    ) -> Result<(), Error> {
        require_admin(&env, &admin)?;

        if price <= 0 || cost_price <= 0 {
            return Err(Error::InvalidPrice);
        }

        let product_key = DataKey::Product(product_id);
        let mut product: Product = env
            .storage()
            .persistent()
            .get(&product_key)
            .ok_or(Error::ProductNotFound)?;

        if product.code != code {
            let new_code_key = DataKey::ProductByCode(code.clone());
            if env.storage().persistent().has(&new_code_key) {
                return Err(Error::DuplicateCode);
            }
            let old_code_key = DataKey::ProductByCode(product.code.clone());
            env.storage().persistent().remove(&old_code_key);
            env.storage().persistent().set(&new_code_key, &product_id);
            bump_persistent(&env, &new_code_key);
        }

        product.code = code;
        product.name = name;
        product.category = category;
        product.origin = origin;
        product.unit = unit;
        product.cost_price = cost_price;
        product.price = price;

        env.storage().persistent().set(&product_key, &product);
        bump_persistent(&env, &product_key);
        bump_instance(&env);

        env.events().publish(
            (symbol_short!("product"), symbol_short!("upd")),
            product_id,
        );

        Ok(())
    }

    pub fn remove_product(env: Env, admin: Address, product_id: u64) -> Result<(), Error> {
        require_admin(&env, &admin)?;

        let product_key = DataKey::Product(product_id);
        let mut product: Product = env
            .storage()
            .persistent()
            .get(&product_key)
            .ok_or(Error::ProductNotFound)?;

        product.is_active = false;
        env.storage().persistent().set(&product_key, &product);
        bump_persistent(&env, &product_key);
        bump_instance(&env);

        env.events().publish(
            (symbol_short!("product"), symbol_short!("rm")),
            product_id,
        );

        Ok(())
    }

    pub fn get_product(env: Env, product_id: u64) -> Result<Product, Error> {
        let product_key = DataKey::Product(product_id);
        let product: Product = env
            .storage()
            .persistent()
            .get(&product_key)
            .ok_or(Error::ProductNotFound)?;
        bump_persistent(&env, &product_key);
        Ok(product)
    }

    pub fn list_products(env: Env) -> Vec<u64> {
        env.storage()
            .instance()
            .get(&DataKey::ProductList)
            .unwrap_or(Vec::new(&env))
    }

    // ─── Stock Management (Admin or Staff) ───

    pub fn import_stock(
        env: Env,
        caller: Address,
        product_id: u64,
        quantity: u64,
        supplier: String,
    ) -> Result<u64, Error> {
        require_staff_or_admin(&env, &caller)?;

        if quantity == 0 {
            return Err(Error::InvalidQuantity);
        }

        let product_key = DataKey::Product(product_id);
        let mut product: Product = env
            .storage()
            .persistent()
            .get(&product_key)
            .ok_or(Error::ProductNotFound)?;

        product.stock += quantity;
        env.storage().persistent().set(&product_key, &product);
        bump_persistent(&env, &product_key);

        let change = StockChange {
            product_id,
            quantity,
            is_import: true,
            changed_by: caller,
            supplier,
            timestamp: env.ledger().timestamp(),
        };

        let log_key = DataKey::StockLog(product_id);
        let mut log: Vec<StockChange> = env
            .storage()
            .persistent()
            .get(&log_key)
            .unwrap_or(Vec::new(&env));
        log.push_back(change);
        env.storage().persistent().set(&log_key, &log);
        bump_persistent(&env, &log_key);
        bump_instance(&env);

        env.events().publish(
            (symbol_short!("stock"), symbol_short!("import")),
            (product_id, quantity),
        );

        Ok(product.stock)
    }

    pub fn export_stock(
        env: Env,
        caller: Address,
        product_id: u64,
        quantity: u64,
    ) -> Result<u64, Error> {
        require_staff_or_admin(&env, &caller)?;

        if quantity == 0 {
            return Err(Error::InvalidQuantity);
        }

        let product_key = DataKey::Product(product_id);
        let mut product: Product = env
            .storage()
            .persistent()
            .get(&product_key)
            .ok_or(Error::ProductNotFound)?;

        if product.stock < quantity {
            return Err(Error::InsufficientStock);
        }

        product.stock -= quantity;
        env.storage().persistent().set(&product_key, &product);
        bump_persistent(&env, &product_key);

        let change = StockChange {
            product_id,
            quantity,
            is_import: false,
            changed_by: caller,
            supplier: String::from_str(&env, ""),
            timestamp: env.ledger().timestamp(),
        };

        let log_key = DataKey::StockLog(product_id);
        let mut log: Vec<StockChange> = env
            .storage()
            .persistent()
            .get(&log_key)
            .unwrap_or(Vec::new(&env));
        log.push_back(change);
        env.storage().persistent().set(&log_key, &log);
        bump_persistent(&env, &log_key);
        bump_instance(&env);

        env.events().publish(
            (symbol_short!("stock"), symbol_short!("export")),
            (product_id, quantity),
        );

        Ok(product.stock)
    }

    pub fn get_stock_log(
        env: Env,
        caller: Address,
        product_id: u64,
    ) -> Result<Vec<StockChange>, Error> {
        require_staff_or_admin(&env, &caller)?;

        let log_key = DataKey::StockLog(product_id);
        let log: Vec<StockChange> = env
            .storage()
            .persistent()
            .get(&log_key)
            .unwrap_or(Vec::new(&env));
        if env.storage().persistent().has(&log_key) {
            bump_persistent(&env, &log_key);
        }
        Ok(log)
    }

    // ─── Buyer Management ───

    pub fn register_buyer(env: Env, buyer: Address, name: String, phone: String) -> Result<(), Error> {
        buyer.require_auth();

        let buyer_key = DataKey::Buyer(buyer.clone());
        if env.storage().persistent().has(&buyer_key) {
            return Err(Error::BuyerExists);
        }

        let buyer_data = Buyer {
            address: buyer.clone(),
            name,
            phone,
            total_spent: 0,
            purchase_count: 0,
            points: 0,
            registered_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&buyer_key, &buyer_data);
        bump_persistent(&env, &buyer_key);

        env.storage()
            .instance()
            .set(&DataKey::Role(buyer.clone()), &Role::Buyer);

        let list_key = DataKey::BuyerList;
        let mut list: Vec<Address> = env
            .storage()
            .persistent()
            .get(&list_key)
            .unwrap_or(Vec::new(&env));
        list.push_back(buyer.clone());
        env.storage().persistent().set(&list_key, &list);
        bump_persistent(&env, &list_key);
        bump_instance(&env);

        env.events()
            .publish((symbol_short!("buyer"), symbol_short!("reg")), buyer);

        Ok(())
    }

    pub fn get_buyer(env: Env, buyer: Address) -> Result<Buyer, Error> {
        let buyer_key = DataKey::Buyer(buyer);
        let buyer_data: Buyer = env
            .storage()
            .persistent()
            .get(&buyer_key)
            .ok_or(Error::BuyerNotFound)?;
        bump_persistent(&env, &buyer_key);
        Ok(buyer_data)
    }

    pub fn list_buyers(env: Env, caller: Address) -> Result<Vec<Address>, Error> {
        require_staff_or_admin(&env, &caller)?;

        let list_key = DataKey::BuyerList;
        let list: Vec<Address> = env
            .storage()
            .persistent()
            .get(&list_key)
            .unwrap_or(Vec::new(&env));
        if env.storage().persistent().has(&list_key) {
            bump_persistent(&env, &list_key);
        }
        Ok(list)
    }

    // ─── Purchasing ───

    pub fn purchase(
        env: Env,
        buyer_addr: Address,
        product_id: u64,
        quantity: u64,
    ) -> Result<PurchaseRecord, Error> {
        buyer_addr.require_auth();

        if quantity == 0 {
            return Err(Error::InvalidQuantity);
        }

        let buyer_key = DataKey::Buyer(buyer_addr.clone());
        let mut buyer_data: Buyer = env
            .storage()
            .persistent()
            .get(&buyer_key)
            .ok_or(Error::BuyerNotFound)?;

        let product_key = DataKey::Product(product_id);
        let mut product: Product = env
            .storage()
            .persistent()
            .get(&product_key)
            .ok_or(Error::ProductNotFound)?;

        if product.stock < quantity {
            return Err(Error::InsufficientStock);
        }

        let total_price = product.price * (quantity as i128);

        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .ok_or(Error::NotInitialized)?;
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&buyer_addr, &admin, &total_price);

        product.stock -= quantity;
        env.storage().persistent().set(&product_key, &product);
        bump_persistent(&env, &product_key);

        let record = PurchaseRecord {
            buyer: buyer_addr.clone(),
            product_id,
            product_code: product.code.clone(),
            quantity,
            total_price,
            timestamp: env.ledger().timestamp(),
        };

        let purchase_log_key = DataKey::PurchaseLog(buyer_addr.clone());
        let mut purchase_log: Vec<PurchaseRecord> = env
            .storage()
            .persistent()
            .get(&purchase_log_key)
            .unwrap_or(Vec::new(&env));
        purchase_log.push_back(record.clone());
        env.storage()
            .persistent()
            .set(&purchase_log_key, &purchase_log);
        bump_persistent(&env, &purchase_log_key);

        buyer_data.total_spent += total_price;
        buyer_data.purchase_count += 1;
        env.storage().persistent().set(&buyer_key, &buyer_data);
        bump_persistent(&env, &buyer_key);

        bump_instance(&env);

        env.events().publish(
            (symbol_short!("purchase"),),
            (buyer_addr, product_id, quantity, total_price),
        );

        Ok(record)
    }

    pub fn get_purchase_history(
        env: Env,
        caller: Address,
        buyer: Address,
    ) -> Result<Vec<PurchaseRecord>, Error> {
        if caller == buyer {
            caller.require_auth();
        } else {
            require_staff_or_admin(&env, &caller)?;
        }

        let log_key = DataKey::PurchaseLog(buyer);
        let log: Vec<PurchaseRecord> = env
            .storage()
            .persistent()
            .get(&log_key)
            .unwrap_or(Vec::new(&env));
        if env.storage().persistent().has(&log_key) {
            bump_persistent(&env, &log_key);
        }
        Ok(log)
    }

    // ─── Admin Utilities ───

    pub fn extend_ttl(env: Env, admin: Address) -> Result<(), Error> {
        require_admin(&env, &admin)?;
        bump_instance(&env);
        Ok(())
    }

    pub fn transfer_admin(
        env: Env,
        current_admin: Address,
        new_admin: Address,
    ) -> Result<(), Error> {
        require_admin(&env, &current_admin)?;

        env.storage().instance().set(&DataKey::Admin, &new_admin);
        env.storage()
            .instance()
            .set(&DataKey::Role(new_admin.clone()), &Role::Admin);
        bump_instance(&env);

        env.events()
            .publish((symbol_short!("admin"), symbol_short!("xfer")), new_admin);

        Ok(())
    }

    pub fn set_token(env: Env, admin: Address, token_address: Address) -> Result<(), Error> {
        require_admin(&env, &admin)?;

        env.storage()
            .instance()
            .set(&DataKey::TokenAddress, &token_address);
        bump_instance(&env);

        Ok(())
    }
}

mod test;
