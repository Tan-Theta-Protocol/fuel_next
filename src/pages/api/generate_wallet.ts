import { NextApiRequest, NextApiResponse } from "next";
import { Wallet } from "fuels";

type WalletKeys = {
  private_key: string;
  public_key: string;
  address: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const wallet = Wallet.generate();
    const walletKeys: WalletKeys = {
      private_key: wallet.privateKey,
      public_key: wallet.publicKey,
      address: wallet.address.toB256(),
    };

    res.status(200).json(walletKeys);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
