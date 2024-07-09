import { NextApiRequest, NextApiResponse } from "next";
import { Wallet } from "fuels";

type WalletKeys = {
  privateKey: string;
  publicKey: string;
  address: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const wallet = Wallet.generate();

    const walletKeys: WalletKeys = {
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      address: wallet.address.toB256(),
    };

    res.status(200).json(walletKeys);
  } catch (error) {
    console.error("Error generating wallet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
