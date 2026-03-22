use soroban_sdk::{Address, Env};

use crate::errors::Error;
use crate::storage::DataKey;
use crate::types::Role;

pub fn require_admin(env: &Env, addr: &Address) -> Result<(), Error> {
    addr.require_auth();
    let admin: Address = env
        .storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(Error::NotInitialized)?;
    if *addr != admin {
        return Err(Error::Unauthorized);
    }
    Ok(())
}

pub fn require_staff_or_admin(env: &Env, addr: &Address) -> Result<(), Error> {
    addr.require_auth();
    let role: Role = env
        .storage()
        .instance()
        .get(&DataKey::Role(addr.clone()))
        .ok_or(Error::Unauthorized)?;
    if role != Role::Staff && role != Role::Admin {
        return Err(Error::Unauthorized);
    }
    Ok(())
}
