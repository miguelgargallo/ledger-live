import type { DeviceAction } from "../../bot/types";
import type { Transaction } from "./types";
import {
  deviceActionFlow,
  formatDeviceAmount,
  SpeculosButton,
} from "../../bot/specs";

export const acceptTransaction: DeviceAction<Transaction, any> =
  deviceActionFlow({
    steps: [
      {
        title: "Receiver",
        button: SpeculosButton.RIGHT,
        expectedValue: ({ transaction }) => transaction.recipient,
      },
      {
        title: "Amount",
        button: SpeculosButton.RIGHT,
        expectedValue: ({ account, status }) => {
          return formatDeviceAmount(account.currency, status.amount, {
            postfixCode: true,
          });
        },
      },
      {
        title: "Fee",
        button: SpeculosButton.RIGHT,
        // TODO: add a expectedValue fn
      },
      {
        title: "Data",
        button: SpeculosButton.RIGHT,
      },
      {
        title: "Sign",
        button: SpeculosButton.BOTH,
      },
      {
        title: "Network",
        button: SpeculosButton.RIGHT,
        expectedValue: () => "Mainnet",
      },
    ],
  });
