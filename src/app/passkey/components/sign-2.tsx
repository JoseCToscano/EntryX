"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { getKey } from "~/lib/utils";
import { Keypair } from "@stellar/stellar-sdk";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Fingerprint, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { api } from "~/trpc/react";

export default function Component() {
  const [step, setStep] = useState(1);
  const [isSigning, setIsSigning] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const generateChallenge = api.wallet.generateChallenge.useQuery();
  const verifyWebAuthn = api.wallet.verifyWebAuthn.useMutation();
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

  const signWithBiometrics = async () => {
    setIsSigning(true);
    signAndSubmitTransaction()
      .then(() => {
        setStep(2);
      })
      .catch((e) => {
        toast.error((e as Error).message ?? "Error signing transaction");
      })
      .finally(() => {
        setIsSigning(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md border-[1px]">
        <CardHeader className="rounded-t-lg border-none bg-zinc-950 text-white">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <Lock className="mr-2" /> Secure Transaction Signing
          </CardTitle>
          <CardDescription className="text-white">
            Multi-factor authentication for enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="mb-4 rounded-lg bg-zinc-100 p-3 text-sm text-gray-800">
            <p className="mb-1 font-semibold">🛡️ Security Measures:</p>
            <ul className="list-inside list-disc">
              <li>End-to-end encryption</li>
              <li>Biometric verification</li>
            </ul>
          </div>
          {step === 1 && (
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Transaction Summary:</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <p className="mb-2 text-sm text-gray-600">
                <strong>From:</strong>{" "}
                {showDetails ? "0x1234...5678" : "••••••••••••"}
              </p>
              <p className="mb-2 text-sm text-gray-600">
                <strong>To:</strong>{" "}
                {showDetails ? "0x9876...5432" : "••••••••••••"}
              </p>
              <p className="mb-2 text-sm text-gray-600">
                <strong>Amount:</strong> {showDetails ? "0.5 ETH" : "••••"}
              </p>
              <p className="mb-2 text-sm text-gray-600">
                <strong>Gas Fee:</strong> {showDetails ? "0.002 ETH" : "••••"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {showDetails ? "0.502 ETH" : "••••"}
              </p>
            </ScrollArea>
          )}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center text-green-600">
              <ShieldCheck className="mb-2 h-16 w-16" />
              <p className="font-semibold">Transaction Signed Successfully</p>
              <p className="mt-2 text-sm text-gray-600">
                Your transaction has been securely signed and submitted.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          {step < 2 && (
            <Button
              className="mt-4 w-full bg-zinc-950 text-neutral-200 hover:bg-zinc-800 hover:text-white"
              onClick={signWithBiometrics}
            >
              {step === 1 && (
                <>
                  {isSigning ? (
                    <Fingerprint className="mr-2 h-4 w-4 animate-pulse" />
                  ) : (
                    <Fingerprint className="mr-2 h-4 w-4" />
                  )}
                  {isSigning ? "Verifying..." : "Sign with Biometrics"}
                </>
              )}
            </Button>
          )}
          <div className="mt-4 flex items-center justify-center">
            <ShieldCheck className="mr-1 text-green-500" size={16} />
            <span className="text-xs text-gray-500">
              Secured by CryptoShield™
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
