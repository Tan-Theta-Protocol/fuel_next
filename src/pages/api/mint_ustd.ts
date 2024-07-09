// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { USTanThetaDollarAbi } from "@/sway-api";
import { USTanThetaDollarAbi__factory } from "@/sway-api";
import {
  bn,
  BN,
  getMintedAssetId,
  Provider,
  Wallet,
  WalletUnlocked,
} from "fuels";
import { z } from "zod";

interface Data {
  message?: string;
  error?: string;
}

const requestDataSchema = z.object({
  amount: z.number(),
  deposit_address: z.string(),
});

type requestData = z.infer<typeof requestDataSchema>;

const contractId = process.env.CONTRACT_ID;
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
const contract = USTanThetaDollarAbi__factory.connect(contractId, wallet);
const subID =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      const body = JSON.parse(req.body);
      const data: requestData = requestDataSchema.parse(body);
      const { amount, deposit_address } = data;

      const mintAmount = bn(amount);
      const txResult = await contract.functions
        .mint({ Address: { bits: deposit_address } }, subID, mintAmount)
        .call();
      res.status(200).json({ message: txResult.transactionId });
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
