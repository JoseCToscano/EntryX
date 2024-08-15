const { exec } = require("child_process");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const issuerSecretKey = process.env.ISSUER_PRIVATE_KEY;
const issuerPublicKey = process.env.ISSUER_PUBLIC_KEY;

/**
 * Issuer Accounts are limited to 4096 unique Events (HEXADECIMAL 3 bytes),
 * each with 65,536 unique Tickets (HEXADECIMAL 4 bytes)
 * @param eventSequence
 * @param ticketSequence
 * @param size
 * MEDIUM: 3 event-bytes + 4 bytes (4096 unique tickets)
 * LARGE: 3 event-bytes + 5 bytes (65,536 unique tickets)
 * X-LARGE: 3 bytes + 6 bytes (16,777,216 unique tickets)
 * @returns string
 */
function createUniqueAssetCode(
  eventSequence, // : number,
  ticketSequence, //: number,
  size, //: "medium" | "large" | "x-large",
) {
  // All assets start with ENTRY
  let code = "ENTRY";
  let uniqueTciketsSize = 4;
  if (size === "large") {
    code = "ENTR";
    uniqueTciketsSize = 5;
  } else if (size === "x-large") {
    code = "TIX";
    uniqueTciketsSize = 6;
  }

  // Add event sequence number in HEX
  code += eventSequence.toString(16).toUpperCase().padStart(3, "X");
  // Add sequence number in HEX
  code += ticketSequence
    .toString(16)
    .toUpperCase()
    .padStart(uniqueTciketsSize, "0");

  return code;
}

async function deployAssetContract(
  eventSequence, // : number,
  ticketSequence, //: number,
) {
  const assetCode = createUniqueAssetCode(
    eventSequence,
    ticketSequence,
    "medium",
  );

  const deploy_command = `stellar contract asset deploy --source ${issuerSecretKey} --network testnet --asset ${assetCode}:${issuerPublicKey};`;
  const fetch_command = `stellar contract id asset --source ${issuerSecretKey} --network testnet --asset ${assetCode}:${issuerPublicKey};`;



  return new Promise((resolve, reject) => {
    exec(deploy_command, (error, stdout, stderr) => {
      if (error) {
        // console.info(`Error deploying contract for ${assetCode}:`, error);
        console.log(`Attempting to fetch existing SAC`);
        exec(fetch_command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error fetching contract for ${assetCode}:`, error);
            reject(error);
          } else if (stderr) {
            console.error(`Stderr output for ${assetCode}:`, stderr);
            reject(stderr);
          } else {
            const address = stdout.trim();
            console.log(`Fetched ${assetCode}, Address: ${address}`);
            resolve({ code: assetCode, issuer: issuerPublicKey, address });
          }
        });
      } else if (stderr) {
        console.error(`Stderr output for ${assetCode}:`, stderr);
        reject(stderr);
      } else {
        const address = stdout.trim();
        console.log(`Deployed ${assetCode}, Address: ${address}`);
        resolve({ code: assetCode, issuer: issuerPublicKey, address });
      }
    });
  });
}

async function main() {
  try {
    for (let eventSequence = 3; eventSequence <= 100; eventSequence++) {
      for (let ticketSequence = 1; ticketSequence <= 5; ticketSequence++) {
        console.log(`Deploying Asset Contract for Event: ${eventSequence}, Ticket: ${ticketSequence}`);
        const {code, issuer, address} = await deployAssetContract(
          eventSequence,
          ticketSequence,
        );
        if(code && issuer && address) {
        await prisma.stellaAssetContract.upsert({
          where: { code, issuer, address },
          create: { code, issuer, address },
          update: { code, issuer, address }
        });
        }else{
            console.error("Error: Asset contract not deployed and stored successfully.", {code, issuer, address});
        }
      }
    }
    console.log("All asset contracts deployed and stored successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // await prisma.$disconnect();
  }
}

main()
  .then(() => console.log("done"))
  .catch(console.error);
