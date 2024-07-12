import { NextApiRequest, NextApiResponse } from "next";
import { bn, Provider, Wallet, WalletUnlocked } from "fuels";
import { z } from "zod";
import { YesnoTokensAbi__factory } from "@/sway-api";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const contractId = process.env.YNTOKEN_CONTRACT_ID;
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
    const contract = YesnoTokensAbi__factory.connect(contractId, wallet);
    const yesSubID = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const noSubID = "0x0000000000000000000000000000000000000000000000000000000000000001";

    const requestDataSchema = z.object({
      poll_id: z.string(),
    });
    type requestData = z.infer<typeof requestDataSchema>;
    let body = req.body;
      if(typeof(req.body)=="string") {
        body = JSON.parse(req.body);
      }
    const data: requestData = requestDataSchema.parse(body);
    console.log(data);
    const { poll_id } = data;
    const amount = bn(100_000_000_000_000_000_000_000_000);
    const yesTxResult = await contract.functions
        .mint({ Address: { bits: "0xe5025c372a7af00958948961d96e67dc519606ff45ae071407085efa039de4c1" } }, yesSubID, amount)
        .call();
    console.log(yesTxResult.transactionId);
    const noTxResult = await contract.functions
        .mint({ Address: { bits: "0xe5025c372a7af00958948961d96e67dc519606ff45ae071407085efa039de4c1" } }, noSubID, amount)
        .call();
    console.log(noTxResult.transactionId);
    res.status(200).json({"yes":yesTxResult.transactionResult.id,"no":noTxResult.transactionResult.id});
  } catch (error) {
    console.error("Error generating wallet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
