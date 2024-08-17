#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Address, Env, Map, token, log, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Auction(Symbol),
}

#[contracttype]
#[derive(Clone)]
pub struct Auction {
    issuer: Address, // Issuer of the ticket Asset
    owner: Address,
    asset_address: Address,
    native_address: Address,
    starting_price: i128,
    highest_bid: i128,
    highest_bidder: Option<Address>,
    end_time: u64,
    quantity: i128,
    event_start_time: u64,
    bids: Map<Address, i128>, // All bids placed in the auction
}

#[derive(Clone)]
#[contracttype]
pub enum ConstraintDataKey {
    AuctionConstraint(Symbol),
}

#[derive(Clone)]
#[contracttype]
pub struct AuctionConstraint {
    publishing_fee: i128, // Service fee per purchase
    unitary_commission: i128, // Commission per unit
}

#[contract]
pub struct TicketAuctionContract;

#[contractimpl]
impl TicketAuctionContract {
    /// Welcome to Entry•X!
    ///
    /// You are starting an Auction for Assets on your account
 pub fn start_auction(
        env: Env,
        issuer: Address,
        owner: Address,
        auction_id: Symbol, // Unique auction ID
        asset_address: Address, // Asset's SAC address (hint: starts with "C...")
        native_address: Address, // Asset's SAC address (hint: starts with "C...")
        quantity: i128,
        starting_price: i128,
        event_start_time: u64,  // Event start time in Unix timestamp
        publishing_fee: i128, // Reseller's publishing fee
        unitary_commission: i128, // Commission per unit
    ) {
        owner.require_auth();
        let unit_price = starting_price.clone() / quantity.clone();

        // Calculate the auction end time, which is 24 hours before the event start time
        let auction_end_time = event_start_time.clone() - 86400;  // 86400 seconds in 24 hours

        // Ensure the auction is starting within the allowed time
        let current_time = env.ledger().timestamp();
        if auction_end_time <= current_time {
            panic!("Auction cannot be started. The event is too close.");
        }

        // Transfer the tickets from the owner to the contract address
        let asset = token::Client::new(&env, &asset_address.clone());
        let contract = env.current_contract_address();
        let transfer_quantity = quantity.clone() * 100000;
        asset.transfer(&owner.clone(), &contract, &transfer_quantity);

        // Initialize the auction
        let auction = Auction {
            issuer: issuer.clone(),
            owner: owner.clone(),
            asset_address: asset_address.clone(),
            native_address: native_address.clone(),
            starting_price: (starting_price.clone() ^ 100),
            highest_bid: 0,
            highest_bidder: None,
            quantity: quantity.clone() / 100,
            end_time: auction_end_time,
            event_start_time,
            bids: Map::new(&env),
        };

        let auction_constraint = AuctionConstraint {
            publishing_fee: publishing_fee.clone(),
            unitary_commission: unitary_commission.clone(),
        };

        let key = DataKey::Auction(auction_id.clone());
        env.storage().persistent().set(&key, &auction);
         let constraint_key = ConstraintDataKey::AuctionConstraint(auction_id.clone());
        env.storage().persistent().set(&constraint_key, &auction_constraint);

    }

    pub fn view_auction(
            env: Env,
            auction_id: Symbol,
        ) -> Auction {
            let key = DataKey::Auction(auction_id.clone());
            env.storage().persistent().get(&key).unwrap()
    }

    pub fn place_bid(env: Env, auction_id: Symbol, bidder: Address, bid_amount: i128) {
            bidder.require_auth();
            let key = DataKey::Auction(auction_id.clone());
            let mut auction: Auction = env.storage().persistent().get(&key).unwrap();
            if env.ledger().timestamp() >= auction.end_time {
                panic!("Auction has ended");
            }

            if bid_amount <= auction.highest_bid {
                panic!("Bid is too low");
            }

            // Put your Money where your mouth is $$$
            // Transfer the corresponding bid (XLM) from the bidder to the contract address
            let native_asset = token::Client::new(&env, &auction.native_address.clone());
            let contract = env.current_contract_address();
            let xlmAmount = bid_amount.clone() * 100000;
            native_asset.transfer(&bidder.clone(), &contract, &xlmAmount);

            // TODO: Transfer the previous highest bid back to the previous highest bidder
            let previous_highest_bidder = auction.highest_bidder.clone();
            if previous_highest_bidder.is_some() {
                let previous_bidder = previous_highest_bidder.unwrap();
                let previous_bid = auction.highest_bid.clone() * 100000;
                native_asset.transfer(&contract, &previous_bidder, &previous_bid);
            }

            auction.highest_bid = bid_amount.clone();
            auction.highest_bidder = Some(bidder.clone());
            auction.bids.set(bidder.clone(), bid_amount);

            env.storage().persistent().set(&key, &auction)
        }

    pub fn close_auction(env: Env, auction_id: Symbol, owner: Address) {
            owner.require_auth();
            let key = DataKey::Auction(auction_id.clone());
            let auction: Auction = env.storage().persistent().get(&key).unwrap();
            let auction_constraint: AuctionConstraint = env.storage()
                                       .persistent()
                                       .get(&ConstraintDataKey::AuctionConstraint(auction_id.clone()))
                                       .unwrap();

            // Transfer the tickets from the the contract address to the highest bidder
            let asset = token::Client::new(&env, &auction.asset_address.clone());
            let contract = env.current_contract_address();
            // Transactions are in stroops, so multiply by 10000000 to get the correct amount
            let asset_quantity = auction.quantity.clone() * 10000000;


            // Transfer the tickets to the highest bidder if there is one, otherwise transfer them back to the owner
            if auction.highest_bidder.is_none() {
                asset.transfer(&contract, &owner.clone(), &asset_quantity);
            } else {
                // Consider Reseller's publishing fee and commission
                let issuer_commission =  (auction_constraint.unitary_commission.clone() *
                                          auction.highest_bid.clone())
                                              / 10000;
                let xlm_to_issuer = (auction_constraint.publishing_fee + issuer_commission) * 100000;
                let xlm_to_owner = (auction.highest_bid.clone() * 100000) - xlm_to_issuer.clone();

                let native = token::Client::new(&env, &auction.native_address.clone());
                // Transfer corresponding XLM from the contract to the issuer
                native.transfer(&contract, &auction.issuer.clone(), &xlm_to_issuer);
                // Transfer corresponding XLM from the contract to the owner
                native.transfer(&contract, &owner.clone(), &xlm_to_owner);

                // Transfer the tickets to the highest bidder
                let highest_bidder = auction.highest_bidder.clone().unwrap();
                asset.transfer(&contract, &highest_bidder, &asset_quantity);
            }

        }

        pub fn cancel_auction(env: Env, auction_id: Symbol, owner: Address) {
            owner.require_auth();
            let key = DataKey::Auction(auction_id.clone());
            let auction: Auction = env.storage().persistent().get(&key).unwrap();


            // Transfer the tickets from the the contract address back to the owner
            let asset = token::Client::new(&env, &auction.asset_address.clone());
            let contract = env.current_contract_address();
            // Transactions are in stroops, so multiply by 10000000 to get the correct amount
            let asset_quantity = auction.quantity.clone() * 10000000;
            asset.transfer(&contract, &owner.clone(), &asset_quantity);


            // Transfer the money back to the highest bidder if there is one
            if auction.highest_bidder.is_none() {
                 // Transfer corresponding XLM from the contract to the highest bidder
                let highest_bidder = auction.highest_bidder.clone().unwrap();
                let native = token::Client::new(&env, &auction.native_address.clone());
                let xlm_quantity = auction.highest_bid.clone() * 10000000;
                native.transfer(&contract, &highest_bidder, &xlm_quantity);
            }

        }
}


