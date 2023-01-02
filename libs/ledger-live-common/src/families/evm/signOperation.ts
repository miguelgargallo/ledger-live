import { ethers } from "ethers";
import { Observable } from "rxjs";
import Eth from "@ledgerhq/hw-app-eth";
import { buildOptimisticOperation } from "./buildOptimisticOperation";
import { Account, SignOperationEvent } from "@ledgerhq/types-live";
import { transactionToUnsignedTransaction } from "./transaction";
import { transactionToEthersTransaction } from "./adapters";
import { Transaction as EvmTransaction } from "./types";
import { withDevice } from "../../hw/deviceAccess";

/**
 * Serialize a Ledger Live transaction into an hex string
 */
export const getSerializedTransaction = async (
  account: Account,
  tx: EvmTransaction,
  signature?: Partial<ethers.Signature>
): Promise<string> => {
  const unsignedTransaction = await transactionToUnsignedTransaction(
    account,
    tx
  );
  const unsignedEthersTransaction =
    transactionToEthersTransaction(unsignedTransaction);

  return ethers.utils.serializeTransaction(
    unsignedEthersTransaction,
    signature as ethers.Signature
  );
};

/**
 * Transforms the ECDSA signature paremeter v hexadecimal string received
 * from the nano into an EIP155 compatible number.
 *
 * Reminder EIP155 transforms v this way:
 * v = chainId * 2 + 35
 * (+ parity 1 or 0)
 */
export const applyEIP155 = (vAsHex: string, chainId: number): number => {
  const v = parseInt(vAsHex, 16);

  if (v === 0 || v === 1) {
    // if v is 0 or 1, it's already representing parity
    return chainId * 2 + 35 + v;
  } else if (v === 27 || v === 28) {
    const parity = v - 27; // transforming v into 0 or 1 to become the parity
    return chainId * 2 + 35 + parity;
  }
  // When chainId is lower than 109, hw-app-eth *can* return a v with EIP155 already applied
  // e.g. bsc's chainId is 56 -> v then equals to 147/148
  //      optimism's chainId is 10 -> v equals to 55/56
  //      ethereum's chainId is 1 -> v equals to 0/1
  //      goerli's chainId is 5 -> v equals to 0/1
  return v;
};

/**
 * Sign Transaction with Ledger hardware
 */
export const signOperation = ({
  account,
  deviceId,
  transaction,
}: {
  account: Account;
  deviceId: string;
  transaction: EvmTransaction;
}): Observable<SignOperationEvent> =>
  withDevice(deviceId)(
    (transport) =>
      new Observable((o) => {
        async function main() {
          o.next({
            type: "device-signature-requested",
          });

          const serializedTxHexString = await getSerializedTransaction(
            account,
            transaction
          ).then((str) => str.slice(2)); // Remove 0x prefix

          // Instanciate Eth app bindings
          const eth = new Eth(transport);
          // Request signature on the nano
          const sig = await eth.signTransaction(
            account.freshAddressPath,
            serializedTxHexString
          );

          o.next({ type: "device-signature-granted" }); // Signature is done

          const { chainId = 0 } = account.currency.ethereumLikeInfo || {};
          // Create a new serialized tx with the signature now
          const signature = await getSerializedTransaction(
            account,
            transaction,
            {
              r: "0x" + sig.r,
              s: "0x" + sig.s,
              v: applyEIP155(sig.v, chainId),
            }
          );

          const operation = buildOptimisticOperation(account, transaction);

          o.next({
            type: "signed",
            signedOperation: {
              operation,
              signature,
              expirationDate: null,
            },
          });
        }

        main().then(
          () => o.complete(),
          (e) => o.error(e)
        );
      })
  );

export default signOperation;
