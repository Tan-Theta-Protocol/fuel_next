import { NextApiRequest, NextApiResponse } from "next";
import { bn, ContractFactory, Provider, Wallet, WalletUnlocked } from "fuels";
import { readFileSync } from "fs";
import { z } from "zod";

const requestDataSchema = z
  .object({
    id: z.number(),
    creatorId: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    stats: z.string(),
    category: z.string(),
    imageUrl: z.string(),
    isFeatured: z.boolean(),
    subcategory: z.string().optional(),
    expiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    settlementDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    tradingVolume: z.number(),
    source: z.string(),
    resolution: z.string(),
    isOrderbookEvent: z.boolean(),
    createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  })
  .strict();

type requestData = z.infer<typeof requestDataSchema>;

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Missing PRIVATE_KEY environment variable");
}
const provider = await Provider.create(
  "https://testnet.fuel.network/v1/graphql"
);
const wallet: WalletUnlocked = Wallet.fromPrivateKey(privateKey, provider);
const byteCode = readFileSync(
  "./contracts/yn_contract/out/release/contract.bin"
);
const abi = JSON.parse(
  readFileSync("./contracts/yn_contract/out/release/contract-abi.json", "utf8")
);
const storageSlots = JSON.parse(
  readFileSync(
    "./contracts/yn_contract/out/release/contract-storage_slots.json",
    "utf-8"
  )
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      try {
        let body = req.body;
        if (typeof req.body == "string") {
          body = JSON.parse(req.body);
        }

        // const data: requestData = requestDataSchema.safeParse(body);
        const factory = new ContractFactory(byteCode, abi, wallet);
        const contract = await factory.deployContract({
          configurableConstants: {
            RESERVE_PREDICATE: {
              bits: "0xe5025c372a7af00958948961d96e67dc519606ff45ae071407085efa039de4c1",
            },
          },
          storageSlots: storageSlots,
        });
        const contractDeployment = await contract.waitForResult();
        res.status(200).json({ contract_id: contract.contractId });
      } catch (err) {
        if (err instanceof z.ZodError) {
          res.status(400).json({ error: "Invalid request body" });
        } else {
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
