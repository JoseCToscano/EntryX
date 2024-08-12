#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Error, String};

#[contracttype]
pub enum DataKey {
    Admin,
    AssetInfo,
    Balance(Address),
}

#[contracttype]
pub struct AllowanceDataKey {
    pub from: Address,
    pub spender: Address,
}

#[contracttype]
pub struct AllowanceValue {
    pub amount: i128,
    pub expiration_ledger: u32,
}

#[contracttype]
pub struct BalanceValue {
    pub amount: i128,
    pub authorized: bool,
    pub clawback: bool,
}

#[contract]
pub struct ConcertTicketContract;

#[contractimpl]
impl ConcertTicketContract {

    /// Returns the number of decimals used to represent amounts of this token.
    ///
    /// # Panics
    ///
    /// If the contract has not yet been initialized.
    pub fn decimals() -> u32 {
        0 // No decimals, as each ticket is a whole unit
    }
    /// Returns the name for this token.
    ///
    /// # Panics
    ///
    /// If the contract has not yet been initialized.
    pub fn name(env: Env) -> String {
        String::from_str(&env, "ENTRYXASSET")
    }
    /// Returns the symbol for this token.
    ///
    /// # Panics
    ///
    /// If the contract has not yet been initialized.
    pub fn symbol(env: Env) -> String {
        String::from_str(&env, "ENTRYX")
    }
    /// Returns the allowance for `spender` to transfer from `from`.
    ///
    /// # Arguments
    ///
    /// * `from` - The address holding the balance of tokens to be drawn from.
    /// * `spender` - The address spending the tokens held by `from`.
    /*fn allowance(env: Env, from: Address, spender: Address) -> i128 {

    }*/

    /// Set the allowance by `amount` for `spender` to transfer/burn from
    /// `from`.
    ///
    /// # Arguments
    ///
    /// * `from` - The address holding the balance of tokens to be drawn from.
    /// * `spender` - The address being authorized to spend the tokens held by
    ///   `from`.
    /// * `amount` - The tokens to be made available to `spender`.
    /// * `expiration_ledger` - The ledger number where this allowance expires. Cannot
    ///    be less than the current ledger number unless the amount is being set to 0.
    ///    An expired entry (where expiration_ledger < the current ledger number)
    ///    should be treated as a 0 amount allowance.
    ///
    /// # Events
    ///
    /// Emits an event with topics `["approve", from: Address,
    /// spender: Address], data = [amount: i128, expiration_ledger: u32]`
    /*fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32);
    */
    /// Returns the balance of `id`.
    ///
    /// # Arguments
    ///
    /// * `id` - The address for which a balance is being queried. If the
    ///   address has no existing balance, returns 0.
    pub fn balance(env: Env, id: Address) -> i128 {
        let key = DataKey::Balance(id);
        env.storage().instance().get(&key).unwrap_or(0)
    }

    /// Transfer `amount` from `from` to `to`.
    ///
    /// # Arguments
    ///
    /// * `from` - The address holding the balance of tokens which will be
    ///   withdrawn from.
    /// * `to` - The address which will receive the transferred tokens.
    /// * `amount` - The amount of tokens to be transferred.
    ///
    /// # Events
    ///
    /// Emits an event with topics `["transfer", from: Address, to: Address],
    /// data = [amount: i128]`
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        let mut from_balance = ConcertTicketContract::balance(env.clone(), from.clone());
        let mut to_balance = ConcertTicketContract::balance(env.clone(), to.clone());

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        from_balance -= amount;
        to_balance += amount;

        env.storage().persistent().set(&DataKey::Balance(from.clone()), &from_balance);
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &to_balance);
        env.events().publish(
            ("transfer", from.clone(), to.clone()),
            amount,
        );
    }

    /// Burn `amount` from `from`.
    ///
    /// # Arguments
    ///
    /// * `from` - The address holding the balance of tokens which will be
    ///   burned from.
    /// * `amount` - The amount of tokens to be burned.
    ///
    /// # Events
    ///
    /// Emits an event with topics `["burn", from: Address], data = [amount:
    /// i128]`
    pub fn burn(env: Env, from: Address, amount: i128) {
        let mut from_balance = ConcertTicketContract::balance(env.clone(), from.clone());

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        from_balance -= amount;

        env.storage().persistent().set(&DataKey::Balance(from.clone()), &from_balance);
        env.events().publish(
            ("burn", from.clone()),
            amount
        );
    }

    // Admin Interface
    pub fn set_admin(env: Env, new_admin: Address) {
        env.storage().persistent().set(&DataKey::Admin, &new_admin.clone());
        env.events().publish(("set_admin",)
                             , &new_admin);
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let mut to_balance = ConcertTicketContract::balance(env.clone(), to.clone());
        to_balance += amount;

        env.storage().persistent().set(&DataKey::Balance(to.clone()), &to_balance);

        env.events().publish(("mint", to.clone()), amount);
    }

    pub fn clawback(env: Env, from: Address, amount: i128) {
        let mut from_balance = ConcertTicketContract::balance(env.clone(), from.clone());

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        from_balance -= amount;

        env.storage().persistent().set(&DataKey::Balance(from.clone()), &from_balance);

        env.events().publish(("clawback",), (from, amount));
    }
}
