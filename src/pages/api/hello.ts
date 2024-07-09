// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { USTanThetaDollarAbi } from "@/sway-api";
import { USTanThetaDollarAbi__factory } from "@/sway-api";
import { bn, BN, getMintedAssetId, Provider, Wallet,WalletUnlocked } from "fuels";

type Data = {
  name: string;
};

  const contractId = "0xf46b7c0b0e0fb07d3870c0d3466a894f4362889d366808aae77646981cbca5ad"
  const privateKey = '0xfd886fd2a6b2bc061a0f32ea09000620f661b7c3cebb91707da30101d12a26ed';
  const provider = await Provider.create("https://testnet.fuel.network/v1/graphql");
  const wallet: WalletUnlocked = Wallet.fromPrivateKey(privateKey,provider);
  const contract = USTanThetaDollarAbi__factory.connect(contractId, wallet);
  const subID = "0x0000000000000000000000000000000000000000000000000000000000000000";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const mintedAssetId = getMintedAssetId( contract.id.toHexString(),subID);
  console.log(mintedAssetId);
  const mintAmount = bn(170_700_000_000);
  const txResult = await contract.functions.mint({Address:{bits: wallet.address.toB256()}},subID, mintAmount).call();  
  res.status(200).json({ name: txResult.transactionId });
}
