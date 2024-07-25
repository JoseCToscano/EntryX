import StellarSdk, {
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { postRouter } from "~/server/api/routers/post";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { eventsRouter } from "~/server/api/routers/event";
import { env } from "~/env";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org",
);
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  event: eventsRouter,
  createStellarAccount: publicProcedure.query(async () => {
    console.log("createStellarAccount");
    // After you've got your test lumens from friendbot, we can also use that account to create a new account on the ledger.
    try {
      const server = new StellarSdk.Horizon.Server(
        "https://horizon-testnet.stellar.org",
      );
      const parentAccount = await server.loadAccount(env.ISSUER_PUBLIC_KEY); //make sure the parent account exists on ledger
      console.log(parentAccount);
      const childAccount = StellarSdk.Keypair.random(); //generate a random account to create
      // Log the new account's secret key (make sure to store it securely)
      console.log("New account secret key:", childAccount.secret());
      //create a transacion object.
      let createAccountTx = new StellarSdk.TransactionBuilder(parentAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });
      //add the create account operation to the createAccountTx transaction.
      createAccountTx = await createAccountTx
        .addOperation(
          StellarSdk.Operation.createAccount({
            destination: childAccount.publicKey(),
            startingBalance: "5",
          }),
        )
        .setTimeout(180)
        .build();

      //sign the transaction with the account that was created from friendbot.
      await createAccountTx.sign(
        StellarSdk.Keypair.fromSecret(env.ISSUER_PRIVATE_KEY),
      );
      //submit the transaction
      let txResponse = await server
        .submitTransaction(createAccountTx)
        // some simple error handling
        .catch(function (error) {
          console.log("there was an error");
          console.log(error.response);
          console.log(error.status);
          console.log(error.extras);
          return error;
        });
      console.log(txResponse);
      console.log("Created the new account", childAccount.publicKey());
    } catch (e) {
      console.error("ERROR!", e);
    }
  }),
  fundAccount: publicProcedure.query(async () => {
    try {
      return;
      const issuerKeypair = StellarSdk.Keypair.random();
      console.log("Issuer Public Key:", issuerKeypair.publicKey());
      console.log("Issuer Secret Key:", issuerKeypair.secret());
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(issuerKeypair.publicKey())}`,
      );
      const responseJSON = await response.json();
      console.log("SUCCESS! You have a new account :)\n", responseJSON);
    } catch (e) {
      console.error("ERROR!", e);
    }
  }),
  getAccountDetails: publicProcedure.query(async () => {
    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org",
    );

    // the JS SDK uses promises for most actions, such as retrieving an account
    const account = await server.loadAccount(env.USER_PUBLIC_KEY);
    console.log("Balances for account: " + env.USER_PUBLIC_KEY);
    console.log(account);
    account.balances.forEach(function (balance) {
      console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
    });
  }),
  createAsset: publicProcedure.query(async () => {
    console.log("createAsset");
    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org",
    );

    // Load Issuer Account from Horizon
    const issuerKeypair = StellarSdk.Keypair.fromSecret(env.ISSUER_PRIVATE_KEY);
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    // Load Distributor Account from Horizon
    const distributorKeypair = StellarSdk.Keypair.fromSecret(
      env.DISTRIBUTOR_PRIVATE_KEY,
    );

    const asset = new StellarSdk.Asset("ABC", issuerKeypair.publicKey());
    console.log(asset);
    const transaction = new TransactionBuilder(issuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // Establish trustline between distributor and asset
      .addOperation(
        Operation.changeTrust({
          asset,
          source: distributorKeypair.publicKey(),
        }),
      )
      .addOperation(
        Operation.payment({
          destination: distributorKeypair.publicKey(),
          asset,
          amount: "1",
        }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(issuerKeypair, distributorKeypair);
    const res = await server.submitTransaction(transaction);
    console.log(res);
  }),
  sellAsset: publicProcedure.query(async () => {
    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org",
    );

    // Define the asset to sell
    const asset = new StellarSdk.Asset("ABC", env.ISSUER_PUBLIC_KEY); // replace with your asset code and issuer public key

    // Distributor account
    const distributorKeypair = StellarSdk.Keypair.fromSecret(
      env.DISTRIBUTOR_PRIVATE_KEY,
    );

    // Define the counter asset (e.g., XLM)
    const counterAsset = StellarSdk.Asset.native();

    // Price
    const price = "0.5"; // price in terms of the counter asset

    async function createSellOffer() {
      // Load distributor account
      const distributorAccount = await server.loadAccount(
        distributorKeypair.publicKey(),
      );

      // Build the transaction
      const transaction = new StellarSdk.TransactionBuilder(
        distributorAccount,
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET,
        },
      )
        .addOperation(
          Operation.manageSellOffer({
            selling: asset,
            buying: counterAsset,
            amount: "0.01",
            price: price,
          }),
        )
        .setTimeout(180)
        .build();

      // Sign the transaction
      transaction.sign(distributorKeypair);

      // Submit the transaction
      try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log("Sell offer created successfully:", transactionResult);
      } catch (error) {
        console.error(
          "Error creating sell offer:",
          error.response ? error.response.data : error,
        );
      }
    }

    await createSellOffer();
  }),
  cancelOffer: publicProcedure.query(async () => {
    async function cancelOffer(offerId: string) {
      // Load distributor account
      const distributorAccount = await server.loadAccount(
        env.DISTRIBUTOR_PUBLIC_KEY,
      );
      const distributorKeypair = StellarSdk.Keypair.fromSecret(
        env.DISTRIBUTOR_PRIVATE_KEY,
      );

      // Build the transaction to cancel the offer
      const transaction = new TransactionBuilder(distributorAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          Operation.manageSellOffer({
            offerId: offerId,
            selling: new StellarSdk.Asset("ABC", env.ISSUER_PUBLIC_KEY),
            buying: StellarSdk.Asset.native(),
            amount: "0", // Setting the amount to 0 cancels the offer
            price: "1", // Price is irrelevant here but required
          }),
        )
        .setTimeout(180)
        .build();

      // Sign the transaction
      transaction.sign(distributorKeypair);

      // Submit the transaction
      try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log("Offer cancelled successfully:", transactionResult);
      } catch (error) {
        console.error(
          "Error cancelling offer:",
          error.response ? error.response.data : error,
        );
      }
    }
    await cancelOffer("22066");
  }),
  queryOffers: publicProcedure.query(async () => {
    async function getOffers() {
      const server = new StellarSdk.Horizon.Server(
        "https://horizon-testnet.stellar.org",
      );
      try {
        const offers = await server
          .offers()
          .forAccount(env.DISTRIBUTOR_PUBLIC_KEY)
          .call();
        console.log(
          "Current offers for the distributor account:",
          offers.records,
        );
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    }

    await getOffers();
  }),
  searchOfferBook: publicProcedure.query(async () => {
    // Define the asset to search for
    const asset = new StellarSdk.Asset("ABC", env.ISSUER_PUBLIC_KEY); // replace with your asset code and issuer public key

    async function searchAsset() {
      try {
        const orderbook = await server
          .orderbook(asset, StellarSdk.Asset.native())
          .call();
        console.log("Order book for ABC:", orderbook);
      } catch (error) {
        console.error("Error searching for asset:", error);
      }
    }

    await searchAsset();
  }),
  createBuyOffer: publicProcedure.query(async () => {
    console.log("createBuyOffer");
    // User account
    const userAccount = await server.loadAccount(env.USER_PUBLIC_KEY);
    const userKeypair = StellarSdk.Keypair.fromSecret(env.USER_PRIVATE_KEY);
    console.log("accounts loaded");
    async function createBuyOffer() {
      // Load user account

      // Build the transaction
      const transaction = new TransactionBuilder(userAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        // Ensure the user has a trustline set up for the asset before attempting to buy it
        .addOperation(
          Operation.changeTrust({
            asset: new StellarSdk.Asset("ABC", env.ISSUER_PUBLIC_KEY),
            source: userKeypair.publicKey(),
          }),
        )
        .addOperation(
          Operation.manageBuyOffer({
            selling: StellarSdk.Asset.native(),
            buying: new StellarSdk.Asset("ABC", env.ISSUER_PUBLIC_KEY),
            buyAmount: "0.01",
            price: "0.5",
          }),
        )
        .setTimeout(180)
        .build();
      console.log("transaction built");

      // Sign the transaction
      transaction.sign(userKeypair);
      console.log("transaction signed");
      // Submit the transaction
      try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log("Buy offer created successfully:", transactionResult);
      } catch (error) {
        console.error(
          "Error creating buy offer:",
          error.response ? error.response.data : error,
        );
      }
    }

    await createBuyOffer();
  }),
  queryAssets: publicProcedure.query(async () => {
    console.log("queryAssets");

    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org",
    );
    async function fetchIssuedAssets() {
      try {
        console.log(server.assets());
        const assets = await server
          .assets()
          .forIssuer(env.ISSUER_PUBLIC_KEY)
          .call();

        console.log("Assets issued by the account:");
        assets.records.forEach((asset) => {
          console.log(
            `Asset Code: ${asset.asset_code}, Asset Type: ${asset.asset_type}, Issuer: ${asset.asset_issuer}`,
          );
        });
      } catch (error) {
        console.error("Error fetching issued assets:", error);
      }
    }

    await fetchIssuedAssets();
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
