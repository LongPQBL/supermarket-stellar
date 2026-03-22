#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env, String};
use types::Role;

fn setup_env() -> (
    Env,
    Address,                      // contract_id
    SupermarketContractClient<'static>,
    Address,                      // admin
    Address,                      // token_address
    token::Client<'static>,
    token::StellarAssetClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SupermarketContract, ());
    let client = SupermarketContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = token::Client::new(&env, &token_contract.address());
    let token_admin_client =
        token::StellarAssetClient::new(&env, &token_contract.address());

    client.initialize(&admin, &token_contract.address());

    (
        env,
        contract_id,
        client,
        admin,
        token_contract.address().clone(),
        token_client,
        token_admin_client,
    )
}

fn str(env: &Env, s: &str) -> String {
    String::from_str(env, s)
}

// ─── Initialization Tests ───

#[test]
fn test_initialize() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let role = client.get_role(&admin);
    assert_eq!(role, Some(Role::Admin));
    let _ = env;
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_double_initialize() {
    let (env, _, client, _, token_addr, _, _) = setup_env();
    let admin2 = Address::generate(&env);
    client.initialize(&admin2, &token_addr);
}

// ─── Role Management Tests ───

#[test]
fn test_set_and_get_role() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let staff = Address::generate(&env);

    client.set_role(&admin, &staff, &Role::Staff);
    assert_eq!(client.get_role(&staff), Some(Role::Staff));
}

#[test]
fn test_remove_role() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let staff = Address::generate(&env);

    client.set_role(&admin, &staff, &Role::Staff);
    client.remove_role(&admin, &staff);
    assert_eq!(client.get_role(&staff), None);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_set_role_unauthorized() {
    let (env, _, client, _, _, _, _) = setup_env();
    let non_admin = Address::generate(&env);
    let target = Address::generate(&env);

    client.set_role(&non_admin, &target, &Role::Staff);
}

// ─── Product CRUD Tests ───

#[test]
fn test_add_product() {
    let (env, _, client, admin, _, _, _) = setup_env();

    let id = client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    assert_eq!(id, 1);

    let product = client.get_product(&1u64);
    assert_eq!(product.code, str(&env, "P001"));
    assert_eq!(product.name, str(&env, "Rice"));
    assert_eq!(product.stock, 0);
    assert!(product.is_active);
}

#[test]
#[should_panic(expected = "Error(Contract, #12)")]
fn test_add_product_duplicate_code() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Noodles"),
        &str(&env, "Grains"),
        &str(&env, "Japan"),
        &str(&env, "pack"),
        &30_000_i128,
        &45_000_i128,
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_add_product_staff_unauthorized() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let staff = Address::generate(&env);
    client.set_role(&admin, &staff, &Role::Staff);

    client.add_product(
        &staff,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
}

#[test]
fn test_update_product() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );

    client.update_product(
        &admin,
        &1u64,
        &str(&env, "P001-A"),
        &str(&env, "Jasmine Rice"),
        &str(&env, "Grains"),
        &str(&env, "Thailand"),
        &str(&env, "kg"),
        &55_000_i128,
        &70_000_i128,
    );

    let product = client.get_product(&1u64);
    assert_eq!(product.code, str(&env, "P001-A"));
    assert_eq!(product.name, str(&env, "Jasmine Rice"));
    assert_eq!(product.price, 70_000_i128);
}

#[test]
fn test_remove_product() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );

    client.remove_product(&admin, &1u64);

    let product = client.get_product(&1u64);
    assert!(!product.is_active);
}

#[test]
fn test_list_products() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    client.add_product(
        &admin,
        &str(&env, "P002"),
        &str(&env, "Milk"),
        &str(&env, "Dairy"),
        &str(&env, "Local"),
        &str(&env, "liter"),
        &20_000_i128,
        &30_000_i128,
    );

    let ids = client.list_products();
    assert_eq!(ids.len(), 2);
}

// ─── Stock Management Tests ───

#[test]
fn test_import_stock() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );

    let new_stock = client.import_stock(
        &admin,
        &1u64,
        &100u64,
        &str(&env, "Supplier A"),
    );
    assert_eq!(new_stock, 100);

    let product = client.get_product(&1u64);
    assert_eq!(product.stock, 100);
}

#[test]
fn test_import_stock_by_staff() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let staff = Address::generate(&env);
    client.set_role(&admin, &staff, &Role::Staff);

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );

    let new_stock = client.import_stock(
        &staff,
        &1u64,
        &50u64,
        &str(&env, "Supplier B"),
    );
    assert_eq!(new_stock, 50);
}

#[test]
fn test_export_stock() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    client.import_stock(&admin, &1u64, &100u64, &str(&env, "Supplier A"));

    let new_stock = client.export_stock(&admin, &1u64, &30u64);
    assert_eq!(new_stock, 70);
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_export_stock_insufficient() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    client.import_stock(&admin, &1u64, &10u64, &str(&env, "Supplier A"));

    client.export_stock(&admin, &1u64, &20u64);
}

#[test]
fn test_stock_log() {
    let (env, _, client, admin, _, _, _) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    client.import_stock(&admin, &1u64, &100u64, &str(&env, "Supplier A"));
    client.export_stock(&admin, &1u64, &20u64);

    let log = client.get_stock_log(&admin, &1u64);
    assert_eq!(log.len(), 2);

    let entry0 = log.get(0).unwrap();
    assert!(entry0.is_import);
    assert_eq!(entry0.quantity, 100);

    let entry1 = log.get(1).unwrap();
    assert!(!entry1.is_import);
    assert_eq!(entry1.quantity, 20);
}

// ─── Buyer Management Tests ───

#[test]
fn test_register_buyer() {
    let (env, _, client, _, _, _, _) = setup_env();
    let buyer = Address::generate(&env);

    client.register_buyer(&buyer, &str(&env, "Alice"), &str(&env, "0123456789"));

    let buyer_data = client.get_buyer(&buyer);
    assert_eq!(buyer_data.name, str(&env, "Alice"));
    assert_eq!(buyer_data.phone, str(&env, "0123456789"));
    assert_eq!(buyer_data.total_spent, 0);
    assert_eq!(buyer_data.points, 0);

    assert_eq!(client.get_role(&buyer), Some(Role::Buyer));
}

#[test]
#[should_panic(expected = "Error(Contract, #9)")]
fn test_register_buyer_duplicate() {
    let (env, _, client, _, _, _, _) = setup_env();
    let buyer = Address::generate(&env);

    client.register_buyer(&buyer, &str(&env, "Alice"), &str(&env, "0123456789"));
    client.register_buyer(&buyer, &str(&env, "Alice 2"), &str(&env, "9876543210"));
}

#[test]
fn test_list_buyers() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let buyer1 = Address::generate(&env);
    let buyer2 = Address::generate(&env);

    client.register_buyer(&buyer1, &str(&env, "Alice"), &str(&env, "111"));
    client.register_buyer(&buyer2, &str(&env, "Bob"), &str(&env, "222"));

    let buyers = client.list_buyers(&admin);
    assert_eq!(buyers.len(), 2);
}

// ─── Purchase Tests ───

#[test]
fn test_purchase() {
    let (env, _, client, admin, _, token_client, token_admin_client) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    client.import_stock(&admin, &1u64, &100u64, &str(&env, "Supplier A"));

    let buyer = Address::generate(&env);
    client.register_buyer(&buyer, &str(&env, "Alice"), &str(&env, "0123456789"));

    token_admin_client.mint(&buyer, &1_000_000_i128);

    let record = client.purchase(&buyer, &1u64, &5u64);
    assert_eq!(record.product_id, 1);
    assert_eq!(record.product_code, str(&env, "P001"));
    assert_eq!(record.quantity, 5);
    assert_eq!(record.total_price, 325_000_i128);

    let product = client.get_product(&1u64);
    assert_eq!(product.stock, 95);

    let buyer_data = client.get_buyer(&buyer);
    assert_eq!(buyer_data.total_spent, 325_000_i128);
    assert_eq!(buyer_data.purchase_count, 1);

    assert_eq!(token_client.balance(&buyer), 675_000_i128);
    assert_eq!(token_client.balance(&admin), 325_000_i128);
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_purchase_insufficient_stock() {
    let (env, _, client, admin, _, _, token_admin_client) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    client.import_stock(&admin, &1u64, &2u64, &str(&env, "Supplier A"));

    let buyer = Address::generate(&env);
    client.register_buyer(&buyer, &str(&env, "Alice"), &str(&env, "0123456789"));
    token_admin_client.mint(&buyer, &10_000_000_i128);

    client.purchase(&buyer, &1u64, &10u64);
}

#[test]
fn test_purchase_history() {
    let (env, _, client, admin, _, _, token_admin_client) = setup_env();

    client.add_product(
        &admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
    client.import_stock(&admin, &1u64, &100u64, &str(&env, "Supplier A"));

    let buyer = Address::generate(&env);
    client.register_buyer(&buyer, &str(&env, "Alice"), &str(&env, "0123456789"));
    token_admin_client.mint(&buyer, &10_000_000_i128);

    client.purchase(&buyer, &1u64, &2u64);
    client.purchase(&buyer, &1u64, &3u64);

    let history = client.get_purchase_history(&buyer, &buyer);
    assert_eq!(history.len(), 2);

    let admin_view = client.get_purchase_history(&admin, &buyer);
    assert_eq!(admin_view.len(), 2);
}

// ─── Admin Utility Tests ───

#[test]
fn test_transfer_admin() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let new_admin = Address::generate(&env);

    client.transfer_admin(&admin, &new_admin);

    assert_eq!(client.get_role(&new_admin), Some(Role::Admin));

    client.add_product(
        &new_admin,
        &str(&env, "P001"),
        &str(&env, "Rice"),
        &str(&env, "Grains"),
        &str(&env, "Vietnam"),
        &str(&env, "kg"),
        &50_000_i128,
        &65_000_i128,
    );
}

#[test]
fn test_set_token() {
    let (env, _, client, admin, _, _, _) = setup_env();
    let new_token = Address::generate(&env);

    client.set_token(&admin, &new_token);
}

#[test]
fn test_extend_ttl() {
    let (_env, _, client, admin, _, _, _) = setup_env();
    client.extend_ttl(&admin);
}
