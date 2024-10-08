#![no_std]
use soroban_sdk::{contract, contracttype, Val, IntoVal, contractimpl, Address, Env, Map, token, log, Symbol, symbol_short, vec};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    TicketSale(Address),
}

#[derive(Clone)]
#[contracttype]
pub enum ConstraintDataKey {
    TicketConstraint(Address),
}

#[derive(Clone)]
#[contracttype]
pub struct TicketConstraint {
    service_fee: i128, // Service fee per purchase
    unitary_commission: i128, // Commission per unit
    max_units_per_purchase: i128,
    max_units_per_account: i128,
}

#[contracttype]
#[derive(Clone)]
pub struct TicketSale {
    issuer: Address, // Issuer of the ticket Asset
    distributor: Address, // Distributor of the ticket Asset
    asset_code: Symbol, // Asset code of the ticket Asset
    asset_address: Address, // SAC address of the ticket Asset
    native_address: Address, // SAC address of the native Asset
    price_per_unit: i128, // Price per each ticket Asset
    available_units: i128,
}

#[contract]
pub struct TicketContract;

#[contractimpl]
impl TicketContract {
    /// Welcome to Entry•X!
    ///
    /// You are initializing a new Ticket Asset Sale.
 pub fn initialize_sale(
        env: Env,
        issuer: Address, // Issuer of the ticket Asset
        distributor: Address, // Distributor of the ticket Asset
        asset_code: Symbol, // Asset code of the ticket Asset
        asset_address: Address, // SAC address of the ticket Asset
        native_address: Address, // SAC address of the native Asset
        price_per_unit: i128, // Price per each ticket Asset
        available_units: i128,
        service_fee: i128, // Service fee per purchase
        unitary_commission: i128, // Commission per unit
        max_units_per_purchase: i128,
    ) {
        // Require authorization from both issuer and distributor
        distributor.require_auth();


        // Transfer the tickets from the distributor to the contract address
        let transfer_quantity = available_units.clone() * 100000;

        let contract = env.current_contract_address();
        let asset = token::Client::new(&env, &asset_address.clone());
        asset.transfer(&distributor.clone(), &contract, &transfer_quantity);

        // Initialize the Ticket Asset Sale
        let ticket_sale = TicketSale {
            issuer: issuer.clone(),
            distributor: distributor.clone(),
            asset_code: asset_code.clone(),
            asset_address: asset_address.clone(),
            native_address: native_address.clone(),
            price_per_unit: price_per_unit.clone(),
            available_units: available_units.clone() / 100,
        };


        let ticket_constraint = TicketConstraint {
            service_fee: service_fee.clone(),
            unitary_commission: unitary_commission.clone(),
            max_units_per_purchase: max_units_per_purchase.clone() / 100,
            max_units_per_account: (max_units_per_purchase.clone() /100) * 2,
        };


        let key = DataKey::TicketSale(asset_address.clone());
        env.storage().persistent().set(&key, &ticket_sale);
        let constraint_key = ConstraintDataKey::TicketConstraint(asset_address.clone());
        env.storage().persistent().set(&constraint_key, &ticket_constraint);

    }

    pub fn purchase(
            env: Env,
            asset_address: Address,
            amount: i128,
            buyer: Address
         ) {
            // Require authorization from the buyer
            buyer.require_auth();
            let contract = env.current_contract_address();
            let ticket_sale: TicketSale = env.storage()
                                 .persistent()
                                 .get(&DataKey::TicketSale(asset_address.clone()))
                                 .unwrap();

            let ticket_constraint: TicketConstraint = env.storage()
                                       .persistent()
                                       .get(&ConstraintDataKey::TicketConstraint(asset_address.clone()))
                                       .unwrap();

            // Compute totals
            // Price does not have decimal point (o.g. 9999 instead of 99.99)
            let buyer_service_fee = ticket_constraint.service_fee.clone();
            let tickets_to_buy = amount.clone() / 100;
            let buy_amount = (tickets_to_buy.clone()  * ticket_sale.price_per_unit.clone()) + buyer_service_fee.clone();

            // Check if the buyer has enough balance
            let native = token::Client::new(&env, &ticket_sale.native_address.clone());
            let native_balance = native.balance(&buyer.clone());
            if native_balance < buy_amount {
                panic!("Insufficient balance");
            }

            // Transfer total purchase amount from buyer to contract
            let purchase_total = buy_amount.clone() * 100000;
            let contract = env.current_contract_address();
            let xlm = token::Client::new(&env, &ticket_sale.native_address.clone());
            xlm.transfer(&buyer.clone(), &contract, &purchase_total);

            // Commission is saved as percentage (i.e. 100 = 1%)
            let issuer_commission =  ticket_constraint.unitary_commission.clone() *
                                          (tickets_to_buy.clone() * ticket_sale.price_per_unit.clone())
                                          / 10000;
            let distributor_service_fee = ticket_constraint.service_fee.clone();

            // Transfer commissions from contract to issuer
            let amount_to_issuer = (issuer_commission.clone() + buyer_service_fee + distributor_service_fee.clone()) * 100000;
            xlm.transfer(&contract.clone(), &ticket_sale.issuer.clone(), &amount_to_issuer.clone());


            // Transfer rest of sale from cnotract to distributor (owner)
            let amount_to_distributor = purchase_total - amount_to_issuer;
            xlm.transfer(&contract.clone(), &ticket_sale.distributor, &amount_to_distributor);

            // Transfer Asset from contract to buyer
            let asset = token::Client::new(&env, &asset_address.clone());
            asset.transfer(&contract, &buyer, &(amount * 100000));
    }

}


