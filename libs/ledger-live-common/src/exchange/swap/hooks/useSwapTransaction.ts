import { AmountRequired } from "@ledgerhq/errors";
import { useMemo } from "react";
import {
  ExchangeRate,
  SwapSelectorStateType,
  OnNoRatesCallback,
  SwapTransactionType,
  AvailableProviderV3,
} from "../types";
import useBridgeTransaction from "../../../bridge/useBridgeTransaction";
import { useFromState } from "./useFromState";
import { useProviderRates } from "./useProviderRates";
import { useToState } from "./useToState";
import { useReverseAccounts } from "./useReverseAccounts";
import { Account } from "@ledgerhq/types-live";
import { useUpdateMaxAmount } from "./useUpdateMaxAmount";

export const selectorStateDefaultValues = {
  currency: undefined,
  account: undefined,
  parentAccount: undefined,
  amount: undefined,
};

export type SetExchangeRateCallback = (exchangeRate?: ExchangeRate) => void;

export const useFromAmountError = (
  errors: Record<string, Error | undefined>
): Error | undefined => {
  const fromAmountError = useMemo(() => {
    const [error] = [errors?.gasPrice, errors?.amount]
      .filter(Boolean)
      .filter((error) => !(error instanceof AmountRequired));

    return error;
  }, [errors?.gasPrice, errors?.amount]);

  return fromAmountError;
};

export const useSwapTransaction = ({
  accounts,
  setExchangeRate,
  defaultCurrency = selectorStateDefaultValues.currency,
  defaultAccount = selectorStateDefaultValues.account,
  defaultParentAccount = selectorStateDefaultValues.parentAccount,
  onNoRates,
  excludeFixedRates,
  providers,
  includeDEX,
}: {
  accounts?: Account[];
  setExchangeRate?: SetExchangeRateCallback;
  defaultCurrency?: SwapSelectorStateType["currency"];
  defaultAccount?: SwapSelectorStateType["account"];
  defaultParentAccount?: SwapSelectorStateType["parentAccount"];
  onNoRates?: OnNoRatesCallback;
  excludeFixedRates?: boolean;
  providers?: AvailableProviderV3[];
  includeDEX?: boolean;
} = {}): SwapTransactionType => {
  const bridgeTransaction = useBridgeTransaction(() => ({
    account: defaultAccount,
    parentAccount: defaultParentAccount,
  }));
  const { fromState, setFromAccount, setFromAmount } = useFromState({
    accounts,
    defaultCurrency,
    defaultAccount,
    defaultParentAccount,
    bridgeTransaction,
  });
  const { toState, setToAccount, setToAmount, setToCurrency, targetAccounts } =
    useToState({ accounts });
  const {
    account: fromAccount,
    parentAccount: fromParentAccount,
    currency: fromCurrency,
  } = fromState;
  const { account: toAccount } = toState;
  const transaction = bridgeTransaction?.transaction;

  const fromAmountError = useFromAmountError(bridgeTransaction.status.errors);

  const { isSwapReversable, reverseSwap } = useReverseAccounts({
    accounts,
    fromAccount,
    toAccount,
    fromParentAccount,
    fromCurrency,
    setFromAccount,
    setToAccount,
  });

  const { isMaxEnabled, toggleMax, isMaxLoading } = useUpdateMaxAmount({
    setFromAmount,
    account: fromAccount,
    parentAccount: fromParentAccount,
    transaction,
    feesStrategy: transaction?.feesStrategy,
  });

  const { rates, refetchRates, updateSelectedRate } = useProviderRates({
    fromState,
    toState,
    transaction,
    onNoRates,
    setExchangeRate,
    providers,
    includeDEX,
  });

  return {
    ...bridgeTransaction,
    swap: {
      to: toState,
      from: fromState,
      isMaxEnabled,
      isMaxLoading,
      isSwapReversable,
      rates:
        rates.value && excludeFixedRates
          ? {
              ...rates,
              value: rates.value.filter((v) => v.tradeMethod !== "fixed"),
            }
          : rates,
      refetchRates,
      updateSelectedRate,
      targetAccounts,
    },
    setFromAmount,
    toggleMax,
    fromAmountError,
    setToAccount,
    setToCurrency,
    setFromAccount,
    setToAmount,
    reverseSwap,
  };
};
