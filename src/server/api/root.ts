import { postRouter } from "~/server/api/routers/post";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { eventsRouter } from "~/server/api/routers/event";
import StellarSdk from "@stellar/stellar-sdk";

const PUBLIC_KEY = "GBOWYH7B3WZVJUZQNLYMJ2OJ7UGVAX7QCGL27235YEORH7AWKYUOHLBE";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  event: eventsRouter,
  createKey: publicProcedure.query(async () => {
    console.log("createKey");

    // const issuerKeypair = StellarSdk.Keypair.random();
    //
    // console.log("Issuer Public Key:", issuerKeypair.publicKey());
    // console.log("Issuer Secret Key:", issuerKeypair.secret());

    const astroDollar = new StellarSdk.Asset(
      "AstroDollar",
      PUBLIC_KEY,
      // issuerKeypair.publicKey(),
    );
    console.log("AstroDollar:", astroDollar);
  }),
  queryAssets: publicProcedure.query(async () => {
    console.log("queryAssets");

    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org",
    );
    async function fetchIssuedAssets() {
      try {
        console.log(server.assets());
        const assets = await server.assets().forIssuer(PUBLIC_KEY).call();

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
