import {
  Networks,
  Operation,
  TransactionBuilder,
  Horizon,
  Keypair,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { postRouter } from "~/server/api/routers/post";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { eventsRouter } from "~/server/api/routers/event";
import { env } from "~/env";
import { assetsRouter } from "~/server/api/routers/asset";
import { stellarAccountRouter } from "~/server/api/routers/stellar-account";
import { stellarOfferRouter } from "~/server/api/routers/stellar-offer";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { organizerRouter } from "~/server/api/routers/organizer";
import { sorobanRouter } from "~/server/api/routers/soroban";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  organizer: organizerRouter,
  analytics: analyticsRouter,
  event: eventsRouter,
  stellarOffer: stellarOfferRouter,
  stellarAccountRouter: stellarAccountRouter,
  asset: assetsRouter,
  soroban: sorobanRouter,
  createStellarAccount: publicProcedure.query(async () => {
    console.log("createStellarAccount");
    // After you've got your test lumens from friendbot, we can also use that account to create a new account on the ledger.
    try {
      const server = new Horizon.Server("https://horizon-testnet.stellar.org");
      const parentAccount = await server.loadAccount(env.ISSUER_PUBLIC_KEY); //make sure the parent account exists on ledger
      console.log(parentAccount);
      const childAccount = Keypair.random(); //generate a random account to create
      // Log the new account's secret key (make sure to store it securely)
      console.log("New account secret key:", childAccount.secret());
      //create a transaction object.
      const createAccountTx = new TransactionBuilder(parentAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        //add the create account operation to the createAccountTx transaction.
        .addOperation(
          Operation.createAccount({
            destination: childAccount.publicKey(),
            startingBalance: "5",
          }),
        )
        .setTimeout(180)
        .build();

      //sign the transaction with the account that was created from friendbot.
      createAccountTx.sign(Keypair.fromSecret(env.ISSUER_PRIVATE_KEY));

      //submit the transaction
      const txResponse = await server.submitTransaction(createAccountTx);

      console.log(txResponse);
      console.log("Created the new account", childAccount.publicKey());
    } catch (e) {
      console.error("ERROR!", e);
    }
  }),
  // fundAccount: publicProcedure.query(async () => {
  //   try {
  //     const response = await fetch(
  //       `https://friendbot.stellar.org?addr=${encodeURIComponent(env.USER_PUBLIC_KEY)}`,
  //     );
  //     response
  //       .json()
  //       .then((responseJSON) => {
  //         console.log("SUCCESS! You have a new account :)\n", responseJSON);
  //       })
  //       .catch(console.error);
  //   } catch (e) {
  //     console.error("ERROR!", e);
  //   }
  // }),
  // getAccountDetails: publicProcedure.query(async () => {
  //   const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  //
  //   // the JS SDK uses promises for most actions, such as retrieving an account
  //   const account = await server.loadAccount(env.DISTRIBUTOR_PUBLIC_KEY);
  //   console.log("Balances for account: " + env.DISTRIBUTOR_PUBLIC_KEY);
  //   console.log(account);
  //   account.balances.forEach(function (balance) {
  //     console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
  //   });
  // }),
  // createAsset: publicProcedure.query(async () => {
  //   console.log("createAsset");
  //   // Load Issuer Account from Horizon
  //   const issuerKeypair = Keypair.fromSecret(env.ISSUER_PRIVATE_KEY);
  //   const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
  //   // Load Distributor Account from Horizon
  //   const distributorKeypair = Keypair.fromSecret(env.DISTRIBUTOR_PRIVATE_KEY);
  //
  //   const asset = new Asset("XXX123", issuerKeypair.publicKey());
  //   console.log(asset);
  //   const transaction = new TransactionBuilder(issuerAccount, {
  //     fee: BASE_FEE,
  //     networkPassphrase: Networks.TESTNET,
  //   })
  //     // Establish trustline between distributor and asset
  //     .addOperation(
  //       Operation.changeTrust({
  //         asset,
  //         source: distributorKeypair.publicKey(),
  //       }),
  //     )
  //     .addOperation(
  //       Operation.payment({
  //         destination: distributorKeypair.publicKey(),
  //         asset,
  //         amount: "1",
  //       }),
  //     )
  //     .setTimeout(30)
  //     .build();
  //
  //   transaction.sign(issuerKeypair);
  //   const xdr = transaction.toXDR();
  //   const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
  //   tx.sign(distributorKeypair);
  //   const res = await server.submitTransaction(tx);
  //   console.log(res);
  // }),
  // sellAsset: publicProcedure.query(async () => {
  //   // Define the asset to sell
  //   const asset = new Asset("TIXALPHA", env.ISSUER_PUBLIC_KEY); // replace with your asset code and issuer public key
  //
  //   // Distributor account
  //   const distributorKeypair = Keypair.fromSecret(env.DISTRIBUTOR_PRIVATE_KEY);
  //
  //   // Define the counter asset (e.g., XLM)
  //   const counterAsset = Asset.native();
  //
  //   // Price
  //   const price = "0.01"; // price in terms of the counter asset
  //
  //   async function createSellOffer() {
  //     // Load distributor account
  //     const distributorAccount = await server.loadAccount(
  //       distributorKeypair.publicKey(),
  //     );
  //
  //     // Build the transaction
  //     const transaction = new TransactionBuilder(distributorAccount, {
  //       fee: BASE_FEE,
  //       networkPassphrase: Networks.TESTNET,
  //     })
  //       .addOperation(
  //         Operation.manageSellOffer({
  //           selling: asset,
  //           buying: Asset.native(),
  //           amount: "1",
  //           price: price,
  //         }),
  //       )
  //       .setTimeout(180)
  //       .build();
  //
  //     // Sign the transaction
  //     transaction.sign(distributorKeypair);
  //
  //     // Submit the transaction
  //     try {
  //       const transactionResult = await server.submitTransaction(transaction);
  //       console.log("Sell offer created successfully:", transactionResult);
  //     } catch (e) {
  //       console.log("error : .----");
  //       console.error((e as AxiosError).message);
  //       console.error((e as AxiosError)?.response?.data);
  //       console.error((e as AxiosError)?.response?.data?.detail);
  //       console.error((e as AxiosError)?.response?.data?.title);
  //       console.error(
  //         (e as AxiosError)?.response?.data?.extras?.result_codes?.transaction,
  //       );
  //       console.error(
  //         (e as AxiosError)?.response?.data?.extras?.result_codes?.operations,
  //       );
  //     }
  //   }
  //
  //   await createSellOffer();
  // }),
  // cancelOffer: publicProcedure.query(async () => {
  //   async function cancelOffer(offerId: string) {
  //     // Load distributor account
  //     const distributorAccount = await server.loadAccount(
  //       env.DISTRIBUTOR_PUBLIC_KEY,
  //     );
  //     const distributorKeypair = Keypair.fromSecret(
  //       env.DISTRIBUTOR_PRIVATE_KEY,
  //     );
  //
  //     // Build the transaction to cancel the offer
  //     const transaction = new TransactionBuilder(distributorAccount, {
  //       fee: BASE_FEE,
  //       networkPassphrase: Networks.TESTNET,
  //     })
  //       .addOperation(
  //         Operation.manageSellOffer({
  //           offerId: offerId,
  //           selling: new Asset("ABC", env.ISSUER_PUBLIC_KEY),
  //           buying: Asset.native(),
  //           amount: "0", // Setting the amount to 0 cancels the offer
  //           price: "1", // Price is irrelevant here but required
  //         }),
  //       )
  //       .setTimeout(180)
  //       .build();
  //
  //     // Sign the transaction
  //     transaction.sign(distributorKeypair);
  //
  //     // Submit the transaction
  //     try {
  //       const transactionResult = await server.submitTransaction(transaction);
  //       console.log("Offer cancelled successfully:", transactionResult);
  //     } catch (error) {
  //       console.error("Error cancelling offer:", JSON.stringify(error));
  //     }
  //   }
  //   await cancelOffer("22066");
  // }),
  // queryOffers: publicProcedure.query(async () => {
  //   async function getOffers() {
  //     const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  //     try {
  //       const offers = await server
  //         .offers()
  //         .forAccount(env.DISTRIBUTOR_PUBLIC_KEY)
  //         .call();
  //       console.log(
  //         "Current offers for the distributor account:",
  //         offers.records,
  //       );
  //     } catch (error) {
  //       console.error("Error fetching offers:", error);
  //     }
  //   }
  //
  //   await getOffers();
  // }),
  // searchOfferBook: publicProcedure.query(async () => {
  //   // Define the asset to search for
  //   const asset = new Asset("ENTRY0010003", env.ISSUER_PUBLIC_KEY); // replace with your asset code and issuer public key
  //
  //   async function searchAsset() {
  //     try {
  //       const orderbook = await server.orderbook(asset, Asset.native()).call();
  //       console.log("Order book for ENTRY0010003:", orderbook);
  //     } catch (error) {
  //       console.error("Error searching for asset:", error);
  //     }
  //   }
  //
  //   await searchAsset();
  //   const offers = await server.offers().selling(asset).call();
  //   console.log("offers", offers);
  // }),
  // createBuyOffer: publicProcedure.query(async () => {
  //   console.log("createBuyOffer");
  //   // User account
  //   const userAccount = await server.loadAccount(env.USER_PUBLIC_KEY);
  //   const userKeypair = Keypair.fromSecret(env.USER_PRIVATE_KEY);
  //   console.log("accounts loaded");
  //   async function createBuyOffer() {
  //     // Load user account
  //
  //     // Build the transaction
  //     const transaction = new TransactionBuilder(userAccount, {
  //       fee: BASE_FEE,
  //       networkPassphrase: Networks.TESTNET,
  //     })
  //       // Ensure the user has a trustline set up for the asset before attempting to buy it
  //       .addOperation(
  //         Operation.changeTrust({
  //           asset: new Asset("TIXGeneralAd", env.ISSUER_PUBLIC_KEY),
  //           source: userKeypair.publicKey(),
  //         }),
  //       )
  //       .addOperation(
  //         Operation.manageBuyOffer({
  //           selling: Asset.native(),
  //           buying: new Asset("TIXGeneralAd", env.ISSUER_PUBLIC_KEY),
  //           buyAmount: "1",
  //           price: "0.01",
  //         }),
  //       )
  //       .setTimeout(180)
  //       .build();
  //     console.log("transaction built");
  //
  //     // Sign the transaction
  //     transaction.sign(userKeypair);
  //     console.log("transaction signed");
  //     // Submit the transaction
  //     try {
  //       const transactionResult = await server.submitTransaction(transaction);
  //       console.log("Buy offer created successfully:", transactionResult);
  //     } catch (error) {
  //       console.error("Error creating buy offer:", JSON.stringify(error));
  //     }
  //   }
  //
  //   await createBuyOffer();
  // }),
  // queryAssets: publicProcedure.query(async () => {
  //   console.log("queryAssets");
  //
  //   const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  //   async function fetchIssuedAssets() {
  //     try {
  //       console.log(server.assets());
  //       const assets = await server
  //         .assets()
  //         .forIssuer(env.ISSUER_PUBLIC_KEY)
  //         .call();
  //
  //       console.log("Assets issued by the account:");
  //       assets.records.forEach((asset) => {
  //         console.log(
  //           `Asset Code: ${asset.asset_code}, Asset Type: ${asset.asset_type}, Issuer: ${asset.asset_issuer}`,
  //         );
  //       });
  //     } catch (error) {
  //       console.error("Error fetching issued assets:", error);
  //     }
  //   }
  //
  //   await fetchIssuedAssets();
  // }),
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
