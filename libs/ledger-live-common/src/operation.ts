import type { NFTStandard, Operation } from "@ledgerhq/types-live";
import { decodeAccountId } from "./account";
import { encodeNftId } from "./nft";
import {
  encodeERC1155OperationId,
  encodeERC721OperationId,
} from "./nft/nftOperationId";

const nftOperationIdEncoderPerStandard: Record<
  NFTStandard,
  (...args: any[]) => string
> = {
  ERC721: encodeERC721OperationId,
  ERC1155: encodeERC1155OperationId,
};

import {
  findOperationInAccount,
  encodeOperationId,
  decodeOperationId,
  encodeSubOperationId,
  decodeSubOperationId,
  flattenOperationWithInternalsAndNfts,
  getOperationAmountNumber,
  getOperationAmountNumberWithInternals,
  getOperationConfirmationNumber,
  getOperationConfirmationDisplayableNumber,
  isConfirmedOperation,
  patchOperationWithHash as patchOperationWithHashCoined,
} from "@ledgerhq/coin-framework/lib/operation";

export {
  findOperationInAccount,
  encodeOperationId,
  decodeOperationId,
  encodeSubOperationId,
  decodeSubOperationId,
  flattenOperationWithInternalsAndNfts,
  getOperationAmountNumber,
  getOperationAmountNumberWithInternals,
  getOperationConfirmationNumber,
  getOperationConfirmationDisplayableNumber,
  isConfirmedOperation,
};

export function patchOperationWithHash(
  operation: Operation,
  hash: string
): Operation {
  return patchOperationWithHashCoined(operation, hash, (nftOp, i) => {
    const { currencyId } = decodeAccountId(operation.accountId);
    const nftId = encodeNftId(
      operation.accountId,
      nftOp.contract || "",
      nftOp.tokenId || "",
      currencyId
    );
    const nftOperationIdEncoder =
      nftOperationIdEncoderPerStandard[nftOp?.standard || ""] ||
      nftOperationIdEncoderPerStandard.ERC721;

    return {
      ...nftOp,
      hash,
      id: nftOperationIdEncoder(nftId, hash, nftOp.type, 0, i),
    };
  });
}
