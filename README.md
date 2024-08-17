![Join EntryX Image]([/path/to/image.png](https://utfs.io/f/1a2fb0fd-a49e-4ba4-bcd6-60d7f477bcc3-e5vxbx.m..png) "Join EntryX").

# Entry•X Decentralized Ticketing and Reselling dApp
Welcome to Entry•X! This platform leverages the power of the Stellar blockchain to create a secure, transparent, and efficient marketplace for event tickets. 
Users can purchase, manage, and resell their tickets with ease, all while ensuring the authenticity of their assets.

## Features
- Blockchain-Powered Tickets: Each ticket is a digital asset on the Stellar blockchain, ensuring authenticity and security.
- Freighter Wallet Integration: Securely sign transactions and manage your assets with the Freighter wallet.
- Auction-Based Reselling: Users can resell their tickets on the secondary market through a transparent auction system.
- Smart Contract Enforcement: Soroban smart contracts manage all transactions, ensuring that conditions are met and providing security for both buyers and sellers.

## Tech Stack
  This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

If you are not familiar with the different technologies used in this project, please refer to the respective docs.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)


### Stellar SDK

Used to interact with the Stellar blockchain, handling the creation, management, and transfer of digital assets.
Soroban smart contracts enforce business logic, such as ticket pricing, purchase limits, and auction rules.

Stellar Network is the backbone of the application, providing a decentralized platform for issuing and managing digital assets (tickets).
Soroban is used to write and deploy smart contracts that manage ticket sales, reselling, and auctions.
Installation
To run this dApp locally, follow these steps:

Clone the repository:
```bash
git clone https://github.com/JoseCToscano/EntryX.git
cd entryx
```
Install Dependencies (Make sure to be using Node v20)
```bash
npm install
```
### Environment Variables:

Create a .env file in the root directory and add the necessary environment variables, please refer to .env.example for list of variables.

### Runnning the app:

Freghter Wallet requires HTTPS, so you will need to run the app with the --experimental-https flag.
```bash
npm run dev -- --experimental-https
```

## Usage
### Freighter Wallet Setup
Download the Freighter wallet extension for your browser.
Create a two new account and set up your wallet: One will be the main issuer account, and the other will be a distributor account.
- Issuer Account: This account will be used to issue tickets and manage the platform. All fees and commissions will be credited to this account.
- Distributor Account: This account will be used to distribute tickets to users who purchase them. It will hold the tickets until they are sold or auctioned.
- To be able to create and manage events you will need to setup the distributor's account as an `AuthorizedPartner` (table in the database).

### Stellar Asset Contracts setup
There's a sepcific logic for generating unique Assets for each event, but to interact with their SAC we need to make sure
they have been deployed to the Stellar Network. 
Enter the `scripts` folder and checkout the `fill_sac.cjs` script. This script will create the necessary assets for the events in the database.
Adapt it as necessary to your needs and run it. It will deploy the assets to the Stellar Network and update the database with the necessary information.

Once ready, run the following command and be patient as it may take a while to complete:
```bash
node scripts/fill_sac.cjs
```

### Soroban Smart Contracts
Under the directory `soroban-contracts` you will find two smart contracts that are used in the application:
- `ticket`: This contract is used to publish tickets from Organizers to Users who want to purchase them.
- `auction`: This contract is used to manage the auction process for reselling tickets.

Make sure you have the Stellar CLI installed and run the following commands to build and deploy the contracts:
```bash
stellar contrcact build
 stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/ticket.wasm \
  --source tickets-issuer \
  --network testnet
```
My credentials are stored as `tickets-issuer`. Make sure to replace it with your own.

At the moment, the latest version of the Deployed Smart Contract is kept as Environment Variable in the `.env` file. Make sure to update it as necessary.
Each Deployed Asset and Auction should keep track of the latest version of the Smart Contract they are using.

### Publishing Events
This video shows how to create and publish an event on the Entry•X platform. Watch the video to learn how to set up your event, issue tickets, and manage your event page.

[![Watch the video](https://img.youtube.com/vi/dBaJ4eNTueQ/maxresdefault.jpg)](https://youtu.be/dBaJ4eNTueQ)


### Purchasing Tickets

This video shows how to purchase tickets on the Entry•X platform. Watch the video to learn how to browse available events, select the event you want to attend, and purchase your ticket using the Freighter wallet.

[![Watch the video](https://img.youtube.com/vi/Vwx78gwfvWY/maxresdefault.jpg)](https://youtu.be/Vwx78gwfvWY)

## Contributing
We welcome contributions to improve the platform! Please fork the repository, create a new branch for your feature or bug fix, and submit a pull request.

License
This project is licensed under the Apache License 2.0. See the LICENSE file for details.

This README.md file provides a comprehensive overview of your dApp, including the tech stack, installation instructions, usage guide, and information on how to contribute. Adjust the repository URL and environment variables as needed for your project.



## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
