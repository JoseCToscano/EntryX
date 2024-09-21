import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Keypair } from "@stellar/stellar-sdk";
import { getKey, storeKey } from "~/lib/utils";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import crypto from "crypto";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  RefreshCwIcon,
  ScanIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Icons } from "~/components/icons";
import Image from "next/image";

const address = "0x1234...5678";
const transactions = [
  { id: 1, type: "receive", amount: "0.1 ETH", from: "0xabcd...efgh" },
  { id: 2, type: "send", amount: "0.05 ETH", to: "0x9876...5432" },
  { id: 3, type: "receive", amount: "0.2 ETH", from: "0xijkl...mnop" },
];

const tokens = [
  { id: 1, name: "Ethereum", symbol: "ETH", balance: "1.2345", icon: "🔷" },
  { id: 2, name: "USD Coin", symbol: "USDC", balance: "100.00", icon: "💵" },
  { id: 3, name: "Chainlink", symbol: "LINK", balance: "50.75", icon: "⛓️" },
  { id: 4, name: "Uniswap", symbol: "UNI", balance: "25.5", icon: "🦄" },
];

const StellarWallet: React.FC = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [encrypted, setEncrypted] = useState<boolean>(false);
  const [consoleResult, setConsoleResult] = useState<string>("");
  // tRPC queries and mutations
  const generateChallenge = api.wallet.generateChallenge.useQuery();
  const verifyWebAuthn = api.wallet.verifyWebAuthn.useMutation();

  useEffect(() => {
    if (!window.PublicKeyCredential) {
      console.error("WebAuthn is not supported on this platform.");
      setConsoleResult("WebAuthn is not supported on this platform.");
    } else {
      console.log("WebAuthn is supported.");
      setConsoleResult("WebAuthn is supported.");
    }
    console.log("protocol: ", window.location.protocol);
    console.log("hostname: ", window.location.hostname);
  }, []);

  // Generate or import a Stellar key pair
  const createOrImportStellarKey = async (): Promise<{
    publicKey: string;
    secretKey: string;
  }> => {
    const keypair = Keypair.random(); // Generate Stellar key pair
    setPublicKey(keypair.publicKey());
    console.log("Generated Stellar key pair:");
    console.table({
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    });

    return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
  };

  // Register a new passkey and encrypt the Stellar secret key
  const registerPasskey = async (secretKey: string) => {
    // const { data: challengeData } = await generateChallenge.refetch(); // Generate challenge from the server
    try {
      // Step 2: Register a new passkey using WebAuthn
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: new TextEncoder().encode(
            crypto.randomBytes(32).toString("hex"),
          ), // Use the challenge provided by the server
          rp: { name: "My Web3 Wallet", id: "entryx.me" }, // Relying Party (RP) information
          user: {
            id: new TextEncoder().encode("unique-user-id-base64url"), // Unique user ID (can be user ID from your backend or a randomly generated ID)
            name: "user@example.com", // User's email address
            displayName: "User Example", // User's display name
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }], // Public key algorithm, -7 refers to ES256 (ECDSA with SHA-256)
          authenticatorSelection: { userVerification: "preferred" }, // Prefer biometric or PIN-based authentication
          attestation: "none", // Request attestation for device verification
        },
      })) as PublicKeyCredential;
      console.log("WebAuthn registration response:", credential);

      // Step 3: Extract WebAuthn registration response components
      const attestationObject = (
        credential.response as AuthenticatorAttestationResponse
      ).attestationObject;
      const clientDataJSON = credential.response.clientDataJSON;
      const credentialId = credential.rawId;

      console.log("credentialId: ", credentialId);

      // Step 4: Send the registration data to the server for verification and storage
      await verifyWebAuthn.mutateAsync({
        credentialId: Buffer.from(credentialId).toString("base64"), // Convert credential ID to base64
        clientDataJSON: Buffer.from(clientDataJSON).toString("base64"), // Convert clientDataJSON to base64
        authenticatorData: Buffer.from(attestationObject).toString("base64"), // Convert attestationObject to base64
        publicKey: publicKey ?? "", // Stellar public key
      });

      console.log("Passkey registration successful.");

      // TODO: use server
      //  Store the credential ID after registering the passkey
      localStorage.setItem(
        "credentialId",
        Buffer.from(credentialId).toString("base64"),
      );
      console.log(
        `Saved credential ID: ${Buffer.from(credentialId).toString("base64")}`,
      );

      console.log("here :)");

      // Step 5: Generate an AES encryption key using the WebAuthn passkey (derived from clientDataJSON)
      // Step 5: Generate a random AES key
      const aesKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );

      // After generating the aesKey
      await storeKey("aes-key", aesKey);

      // Step 6: Encrypt the Stellar secret key using the AES key
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        aesKey,
        new TextEncoder().encode(secretKey),
      );

      // Store the encrypted data and IV
      localStorage.setItem(
        "encryptedStellarSecretKey",
        Buffer.from(encryptedData).toString("base64"),
      );
      localStorage.setItem("encryptionIv", Buffer.from(iv).toString("base64"));

      // Mark the secret key as encrypted
      setEncrypted(true);

      console.log("Passkey registration successful, secret key encrypted.");
    } catch (error) {
      toast.error(`Passkey registration failed ${JSON.stringify(error)}`);
      console.error("Passkey registration failed:", error);
      throw new Error("Passkey registration failed");
    }
  };

  // Authenticate using a passkey and decrypt the Stellar secret key
  const authenticatePasskey = async (): Promise<string> => {
    try {
      // Step 1: Retrieve the stored credential ID
      const credentialIdBase64 = localStorage.getItem("credentialId");
      if (!credentialIdBase64) {
        throw new Error(
          "No registered credential ID found. Please register a passkey first.",
        );
      }
      const credentialId = new Uint8Array(
        Buffer.from(credentialIdBase64, "base64"),
      );

      // Step 2: Request a challenge from the server using tRPC
      const { data: challengeData } = await generateChallenge.refetch(); // Fetch challenge from server
      if (!challengeData?.challenge) {
        throw new Error("Failed to retrieve challenge from server.");
      }
      const challenge = new TextEncoder().encode(challengeData.challenge); // Encode challenge

      // Step 3: Authenticate using the existing passkey via WebAuthn
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          allowCredentials: [
            {
              type: "public-key",
              id: credentialId,
            },
          ],
          userVerification: "preferred",
        },
      })) as PublicKeyCredential;

      // Step 4: Extract necessary components from the WebAuthn response
      const authenticatorData = (
        credential.response as AuthenticatorAssertionResponse
      ).authenticatorData;
      const clientDataJSON = credential.response.clientDataJSON;
      const signature = (credential.response as AuthenticatorAssertionResponse)
        .signature;

      // Step 5: Send the authentication response to the server for verification
      await verifyWebAuthn.mutateAsync({
        credentialId: Buffer.from(credential.rawId).toString("base64"),
        clientDataJSON: Buffer.from(clientDataJSON).toString("base64"),
        authenticatorData: Buffer.from(authenticatorData).toString("base64"),
        signature: Buffer.from(signature).toString("base64"),
      });

      // Retrieve the AES key from IndexedDB
      const aesKey = await getKey("aes-key");

      // Step 7: Retrieve the encrypted Stellar secret key and IV from local storage
      const encryptedDataBase64 = localStorage.getItem(
        "encryptedStellarSecretKey",
      );
      const ivBase64 = localStorage.getItem("encryptionIv");
      if (!encryptedDataBase64 || !ivBase64) {
        throw new Error("Encrypted data or IV not found.");
      }
      const encryptedData = Buffer.from(encryptedDataBase64, "base64");
      const iv = Buffer.from(ivBase64, "base64");

      // Step 8: Decrypt the Stellar secret key using the AES key
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        aesKey,
        encryptedData,
      );
      const stellarSecretKey = new TextDecoder().decode(decryptedData);

      // Step 9: Return the decrypted Stellar secret key
      return stellarSecretKey;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw new Error("Authentication failed");
    }
  };

  // Sign and submit a Stellar transaction
  const signAndSubmitTransaction = async (): Promise<void> => {
    const secretKey = await authenticatePasskey(); // Decrypt the Stellar secret key
    const keypair = Keypair.fromSecret(secretKey);
    console.log("Decrypted Stellar key pair:");
    console.table({
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-400 to-blue-100 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
        <CardHeader className="relative pb-2">
          <CardTitle className="text-center text-2xl font-bold">
            Stellar Wallet
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            aria-label="Scan QR Code"
          >
            <ScanIcon className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-center">
            <p className="mb-1 text-sm text-gray-500">Your Balance</p>
            <h2 className="text-4xl font-bold">1001.1234 XLM</h2>
          </div>
          <div className="mb-6 flex justify-between">
            <Button variant="outline" className="w-[48%]">
              <ArrowUpIcon className="mr-2 h-4 w-4" /> Send
            </Button>
            <Button variant="outline" className="w-[48%]">
              <ArrowDownIcon className="mr-2 h-4 w-4" /> Receive
            </Button>
          </div>
          <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-100 p-3">
            <span className="text-sm text-gray-600">{address}</span>
            <Button variant="ghost" size="icon">
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-6">
            <h3 className="mb-2 font-semibold">Your Assets</h3>
            <ul className="space-y-2">
              {tokens.map((token) => (
                <li
                  key={token.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">{token.icon}</span>
                    <div>
                      <p className="font-medium">{token.name}</p>
                      <p className="text-sm text-gray-500">{token.symbol}</p>
                    </div>
                  </div>
                  <span className="font-medium">{token.balance}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Recent Transactions</h3>
              <Button variant="ghost" size="icon">
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                >
                  <div className="flex items-center">
                    {tx.type === "receive" ? (
                      <ArrowDownIcon className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUpIcon className="mr-2 h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {tx.type === "receive" ? "From" : "To"}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      {tx.type === "receive" ? tx.from : tx.to}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${tx.type === "receive" ? "text-green-500" : "text-red-500"}`}
                  >
                    {tx.type === "receive" ? "+" : "-"}
                    {tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      {/*<button*/}
      {/*  onClick={async () => {*/}
      {/*    // const { publicKey, secretKey } = await createOrImportStellarKey();*/}
      {/*    // alert("Stellar key pair generated:\nPublic Key: " + publicKey);*/}
      {/*    await registerPasskey("secretKey");*/}
      {/*    alert("Secret Key encrypted and stored.");*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Generate Stellar Key*/}
      {/*</button>*/}

      {/*{encrypted && (*/}
      {/*  <>*/}
      {/*    <button onClick={signAndSubmitTransaction}>*/}
      {/*      Sign and Submit Transaction*/}
      {/*    </button>*/}
      {/*  </>*/}
      {/*)}*/}
    </div>
  );
};

export default StellarWallet;
