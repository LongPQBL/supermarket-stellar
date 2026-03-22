use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    ProductNotFound = 4,
    ProductExists = 5,
    InsufficientStock = 6,
    InvalidQuantity = 7,
    BuyerNotFound = 8,
    BuyerExists = 9,
    InvalidPrice = 10,
    InsufficientFunds = 11,
    DuplicateCode = 12,
}
