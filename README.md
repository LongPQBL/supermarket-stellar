# SPMK - Supermarket On-Chain

## Problem
Traditional supermarket management systems lack transparency in inventory tracking and purchase records, making it difficult for stakeholders to verify stock movements and transactions.

## Solution
A decentralized supermarket management application built on Stellar/Soroban that brings product management, stock tracking, buyer registration, and purchase transactions on-chain with role-based access control (Admin, Staff, Buyer).

## Why Stellar
Soroban smart contracts provide fast, low-cost transactions ideal for high-frequency retail operations, with built-in token transfer support (XLM SAC) for seamless on-chain payments.

## Target User
Small-to-medium supermarket owners and their staff who want transparent, verifiable inventory and sales management, and buyers who want a trustless purchasing experience.

## Live Demo
- Network: Stellar Testnet
- Contract ID: CB5UAGRTUO2I6VDU2AXZLGQDZAYMTUZLXVWPFWDCY7T4VNDY7CZROV26
- Transaction: https://stellar.expert/explorer/testnet/tx/8b568598af479a4029fcee2e1496e48ccb800be32f913f76fb814748d0847261
<img width="1428" height="607" alt="image" src="https://github.com/user-attachments/assets/479f3432-1a2a-44f7-83a8-609ecf415023" />



## How to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/LongPQBL/supermarket-stellar.git
   cd supermarket-stellar
   ```

2. **Set up the smart contract**
   ```bash
   cd spmk-contract
   cp .env.example .env   # fill in your ADMIN_ADDRESS, DEPLOYER_ACCOUNT, CONTRACT_ID
   make build
   make test
   ```

3. **Set up the frontend**
   ```bash
   cd spmk-fe
   cp .env.example .env   # fill in your contract ID and network config
   npm install
   npm run dev
   ```

4. **Open the app** at `http://localhost:5173` and connect your Stellar wallet (Freighter, xBull, or Hana).

## Team
| Name | Telegram | Gmail | Background |
|------|----------|-------|------------|
| Long | @longphan810 | phannguyen161118@gmail.com| Quoc Hoc Hue High School Grade 12 |

