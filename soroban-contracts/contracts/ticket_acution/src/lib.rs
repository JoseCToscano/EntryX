#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Address, Env, Map, token, log, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Auction(Symbol),
}

// CBKVQIAGAOYMTJWFCO6U546TUE4YCPAPEXHJGTQBMYAC6J6HRPV6JOXX
// CBTDQVG4PUT6KRIQVMPDIY6CJVYWEY45OYAKM6MBSFGWOSGUVJZYW3HY

#[contracttype]
#[derive(Clone)]
pub struct Auction {
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
        auction_id: Symbol, // Unique auction ID
        asset_address: Address, // Asset's SAC address (hint: starts with "C...")
        native_address: Address, // Asset's SAC address (hint: starts with "C...")
        quantity: i128,
        starting_price: i128,
        purchase_price: i128,  // Price at which the ticket was originally purchased
        event_start_time: u64,  // Event start time in Unix timestamp
    ) {
        owner.require_auth();
        let unit_price = starting_price.clone() / quantity.clone();

        // Ensure the starting price is not over the unit price
        if unit_price > purchase_price {
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
        let transfer_quantity = quantity.clone() * 100000;
        asset.transfer(&owner.clone(), &contract, &transfer_quantity);

        // Initialize the auction
        let auction = Auction {
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
        let key = DataKey::Auction(auction_id.clone());
        log!(&env,"Before setting auction");
        env.storage().persistent().set(&key, &auction);
        log!(&env,"After setting auction");
//         env.storage().persistent().get(&key).unwrap()
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
                let previous_bid = auction.highest_bid.clone() * 10000000;
                native_asset.transfer(&contract, &previous_bidder, &previous_bid);
            }

            auction.highest_bid = bid_amount.clone() / 100;
            auction.highest_bidder = Some(bidder.clone());
            auction.bids.set(bidder.clone(), bid_amount / 100);

            env.storage().persistent().set(&key, &auction)
        }

    pub fn close_auction(env: Env, auction_id: Symbol, owner: Address) {
            owner.require_auth();
            let key = DataKey::Auction(auction_id.clone());
            let auction: Auction = env.storage().persistent().get(&key).unwrap();


            // Transfer the tickets from the the contract address to the highest bidder
            let asset = token::Client::new(&env, &auction.asset_address.clone());
            let contract = env.current_contract_address();
            // Transactions are in stroops, so multiply by 10000000 to get the correct amount
            let asset_quantity = auction.quantity.clone() * 10000000;


            // Transfer the tickets to the highest bidder if there is one, otherwise transfer them back to the owner
            if auction.highest_bidder.is_none() {
                asset.transfer(&contract, &owner.clone(), &asset_quantity);
            } else {

                // Transfer corresponding XLM from the contract to the owner
                let native = token::Client::new(&env, &auction.native_address.clone());
                // Transactions are in stroops, so multiply by 10000000 to get the correct amount
                let xlm_quantity = auction.highest_bid.clone() * 10000000;
                native.transfer(&contract, &owner.clone(), &xlm_quantity);

                // Transfer the tickets to the highest bidder
                let highest_bidder = auction.highest_bidder.clone().unwrap();
                asset.transfer(&contract, &highest_bidder, &asset_quantity);
            }

        }
}


