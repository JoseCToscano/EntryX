import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ShieldCheck, Fingerprint } from "lucide-react";

interface TransactionDetails {
  from: string;
  to: string;
  amount: string;
  gas: string;
}

export default function Component() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock transaction details
  const transaction: TransactionDetails = {
    from: "0x1234...5678",
    to: "0x8765...4321",
    amount: "0.5 ETH",
    gas: "0.0021 ETH",
  };

  const handleBiometricAuth = () => {
    // In a real application, this would trigger the biometric authentication
    // For this example, we'll just simulate it with a timeout
    setTimeout(() => setIsAuthenticated(true), 1500);
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl font-bold">
          <ShieldCheck className="mr-2 h-6 w-6 text-green-500" />
          Secure Transaction Signing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">From: {transaction.from}</p>
          <p className="text-sm font-medium">To: {transaction.to}</p>
          <p className="text-sm font-medium">Amount: {transaction.amount}</p>
          <p className="text-sm font-medium">Gas Fee: {transaction.gas}</p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Please review the transaction details carefully before signing.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleBiometricAuth}
          disabled={isAuthenticated}
        >
          {isAuthenticated ? (
            "Transaction Signed"
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" />
              Sign with Biometrics
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
