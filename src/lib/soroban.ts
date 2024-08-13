import { promisify } from "util";
import { exec } from "child_process";
import {
  Contract,
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  Networks,
  xdr,
  Address,
} from "@stellar/stellar-sdk";
import { env } from "~/env";
const execute = promisify(exec);

const rpcUrl = "https://soroban-testnet.stellar.org";
export async function exe(command: string) {
  const { stdout, stderr } = await execute(command);
  if (stderr) {
    console.error(stderr);
  }
  return stdout;
}

export const stringToSymbol = (val: string) => {
  return nativeToScVal(val, { type: "symbol" });
};

export const numberToU64 = (val: number) => {
  const num = parseInt((val * 100).toFixed(0));
  return nativeToScVal(num, { type: "u64" });
};

export const numberToi128 = (val: number) => {
  const num = parseInt((val * 100).toFixed(0));
  return nativeToScVal(num, { type: "i128" });
};

// Convert Stellar address to ScVal
export function addressToScVal(addressStr: string) {
  Address.fromString(addressStr);
  // Convert to ScVal as an Object with Bytes
  return nativeToScVal(Address.fromString(addressStr));
}
export function nativize<T>(val: xdr.ScVal): T {
  return scValToNative(val) as T;
}
export async function contractInt(
  address: string,
  contractMethod: string,
  values: xdr.ScVal[],
) {
  const keyPair = Keypair.fromSecret(env.ISSUER_PRIVATE_KEY);
  const caller = keyPair.publicKey();
  console.log("Here is the caller", caller);
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
  const sourceAccount = await provider.getAccount(caller);
  console.log("Here is the source account", sourceAccount);
  const contract = new Contract(address);
  console.log("Here is the contract", contract);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(contractMethod, ...values))
    .setTimeout(30)
    .build();
  console.log("Here is the transaction");
  try {
    const prepareTx = await provider.prepareTransaction(transaction);
    console.log("prepared TX");
    prepareTx.sign(keyPair);
    console.log("signed TX");
    const sendTx = await provider.sendTransaction(prepareTx);
    console.log("sent TX");
    if (sendTx.errorResult) {
      console.log("Error", sendTx.errorResult);
      throw new Error("Unable to send transaction");
    }
    if (sendTx.status === "PENDING") {
      let txResponse = await provider.getTransaction(sendTx.hash);
      while (
        txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
      ) {
        txResponse = await provider.getTransaction(sendTx.hash);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        return txResponse.returnValue;
      }
    }
  } catch (e) {
    console.log("Error", e);
    throw new Error("Unable to send transaction");
  }
}

export async function getContractXDR(
  address: string,
  contractMethod: string,
  caller: string,
  values: xdr.ScVal[],
) {
  console.log("Here is the caller", caller);
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
  const sourceAccount = await provider.getAccount(caller);
  console.log("Here is the source account", sourceAccount);
  const contract = new Contract(address);
  console.log("Here is the contract", contract);
  console.log();
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(contractMethod, ...values))
    .setTimeout(30)
    .build();
  console.log("Here is the transaction");
  try {
    const prepareTx = await provider.prepareTransaction(transaction);
    return prepareTx.toXDR();
  } catch (e) {
    console.log("Error", e);
    throw new Error("Unable to send transaction");
  }
}

export async function callContract(
  address: string,
  contractMethod: string,
  caller: string,
  values: xdr.ScVal[],
) {
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
  const sourceAccount = await provider.getAccount(caller);
  const contract = new Contract(address);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(contractMethod, ...values))
    .setTimeout(30)
    .build();
  console.log("Here is the transaction");
  try {
    const prepareTx = await provider.prepareTransaction(transaction);
    console.log("prepared TX");
    console.log("signed TX");
    const sendTx = await provider.sendTransaction(prepareTx);
    console.log("sent TX");
    if (sendTx.errorResult) {
      console.log("Error", sendTx.errorResult);
      throw new Error("Unable to send transaction");
    }
    if (sendTx.status === "PENDING") {
      let txResponse = await provider.getTransaction(sendTx.hash);
      while (
        txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
      ) {
        txResponse = await provider.getTransaction(sendTx.hash);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        return txResponse.returnValue;
      }
    }
  } catch (e) {
    console.log("Error", e);
    throw new Error("Unable to send transaction");
  }
}

export async function callWithSignedXDR(xdr: string) {
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
  const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
  const sendTx = await provider.sendTransaction(transaction);
  console.log("sent TX");
  if (sendTx.errorResult) {
    console.log("Error", sendTx.errorResult);
    throw new Error("Unable to send transaction");
  }
  if (sendTx.status === "PENDING") {
    let txResponse = await provider.getTransaction(sendTx.hash);
    while (
      txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
    ) {
      txResponse = await provider.getTransaction(sendTx.hash);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return txResponse.returnValue;
    } else {
      console.log("Error", txResponse);
      throw new Error("Unable to send transaction");
    }
  }
}
