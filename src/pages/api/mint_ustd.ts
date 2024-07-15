// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  bn,
  BN,
  getMintedAssetId,
  Provider,
  Wallet,
  WalletUnlocked,
} from "fuels";
import { z } from "zod";
import {  ContractAbi__factory } from "@/sway/ustd_contract";

interface Data {
  fuel_transaction_hash?: string;
  error?: string;
  status?: string;
}

const requestDataSchema = z.object({
  amount: z.number(),
  deposit_address: z.string(),
});

type requestData = z.infer<typeof requestDataSchema>;

const contractId = process.env.USTD_CONTRACT_ID;
if (!contractId) {
  throw new Error("Missing contract id environment variable");
}
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Missing PRIVATE_KEY environment variable");
}

const provider = await Provider.create(
  "https://testnet.fuel.network/v1/graphql"
);
const wallet: WalletUnlocked = Wallet.fromPrivateKey(privateKey, provider);
const contract = ContractAbi__factory.connect(contractId, wallet);
const subID =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      let body = req.body;
      if(typeof(req.body)=="string") {
        body = JSON.parse(req.body);
      }
      const data: requestData = requestDataSchema.parse(body);
      const { amount, deposit_address } = data;
      const mintAmount = bn(amount);
      const ustdTokenMint = await contract.functions
        .mint({ Address: { bits: deposit_address } }, subID, mintAmount);
      const ustdTokenMintTxn = await (await ustdTokenMint.call()).waitForResult()
    
      res.status(200).json({ fuel_transaction_hash: ustdTokenMintTxn.transactionId,status: ustdTokenMintTxn.transactionResult?.status});
    } catch (err) {
      console.log(err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request body" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
