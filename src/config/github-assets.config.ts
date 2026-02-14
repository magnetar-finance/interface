import { isAddress } from "viem";
import { z } from "zod";

export const AssetResponseSchema = z.array(
  z.object({
    name: z.string(),
    address: z.string().refine((arg) => isAddress(arg)),
    symbol: z.string(),
    logoURI: z.union([z.url().min(1), z.base64().min(1)]),
    decimals: z.int().max(2 ** 8),
    chainId: z.int(),
  }),
);

export type AssetResponseType = z.infer<typeof AssetResponseSchema>;
