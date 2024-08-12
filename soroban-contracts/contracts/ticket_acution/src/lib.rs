#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Address, Env, token};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Auction(Address, u64),  // key is (owner, auction_id)
}

// CBKVQIAGAOYMTJWFCO6U546TUE4YCPAPEXHJGTQBMYAC6J6HRPV6JOXX

#[contracttype]
#[derive(Clone)]
pub struct Auction {
    owner: Address,
    asset_address: Address,  // CODE:ISSUER
    starting_price: u64,
    highest_bid: u64,
    highest_bidder: Option<Address>,
    max_resell_price: u64,
    end_time: u64,
    event_start_time: u64,
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
        owner: Address,
        auction_id: u64, // Unique auction ID
        asset_address: Address,  // CODE:ISSUER
        quantity: i128,
        starting_price: u64,
        purchase_price: u64,  // Price at which the ticket was originally purchased
        event_start_time: u64,  // Event start time in Unix timestamp
    ) {
        let max_resell_price = purchase_price.clone() * 150 / 100;

        // Ensure the starting price is not higher than the purchase price
        if starting_price > purchase_price {
            panic!("Starting price cannot be higher than the original purchase price.");
        }

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
        asset.transfer(&owner.clone(), &contract, &quantity);

        // Initialize the auction
        let auction = Auction {
            owner: owner.clone(),
            asset_address: asset_address.clone(),
            starting_price: starting_price.clone(),
            highest_bid: 0,
            highest_bidder: None,
            max_resell_price,
            end_time: auction_end_time,
            event_start_time,
        };
        let key = DataKey::Auction(owner.clone(), auction_id);
        env.storage().instance().set(&key, &auction);
    }

    pub fn view_auction(
            env: Env,
            owner: Address,
            auction_id: u64,
        ) -> Auction {
            let key = DataKey::Auction(owner.clone(), auction_id);
            return env.storage().instance().get(&key).unwrap();
    }

    pub fn place_bid(env: Env, auction_id: u64, owner: Address, bidder: Address, bid_amount: u64) {
            bidder.require_auth();
            let key = DataKey::Auction(owner.clone(), auction_id);
            let mut auction: Auction = env.storage().instance().get(&key).unwrap();
            if env.ledger().timestamp() >= auction.end_time {
                panic!("Auction has ended");
            }

            if bid_amount <= auction.highest_bid {
                panic!("Bid is too low");
            }

            auction.highest_bid = bid_amount;
            auction.highest_bidder = Some(bidder.clone());

            env.storage().instance().set(&key, &auction);
        }
}


