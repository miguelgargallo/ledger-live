import { useSelector } from "react-redux";
import type { AccountLike, PortfolioRange } from "@ledgerhq/types-live";
import type {
  TokenCurrency,
  CryptoCurrency,
} from "@ledgerhq/types-cryptoassets";
import {
  useBalanceHistoryWithCountervalue as useBalanceHistoryWithCountervalueCommon,
  usePortfolio as usePortfolioCommon,
  useCurrencyPortfolio as useCurrencyPortfolioCommon,
} from "@ledgerhq/live-common/portfolio/v2/react";
import { GetPortfolioOptionsType } from "@ledgerhq/live-common/portfolio/v2/index";
import {
  selectedTimeRangeSelector,
  counterValueCurrencySelector,
} from "../reducers/settings";
import { accountsSelector } from "../reducers/accounts";

export function useBalanceHistoryWithCountervalue({
  account,
  range,
}: {
  account: AccountLike;
  range: PortfolioRange;
}) {
  const to = useSelector(counterValueCurrencySelector);
  return useBalanceHistoryWithCountervalueCommon({
    account,
    range,
    to,
  });
}

/** TODO: Optimise this, there is big to win here as the computation often takes a long time (>50ms sometimes or more)
 * - split in 2 hooks: one that uses accounts from the store, one that uses accounts passed as params
 * - move countervalues state to the redux store, (current implementation is with a useReducer passed to a context)
 * - this way we will able to implement this hook using useSelector and one big memoised selector (with reselect),
 *   which is much easier if all the data comes from the store.
 *
 *  - one step further would be to throttle the "accounts selection" part as today for a user with many accounts,
 *    one "sync" produces many successive updates of `accounts` array at short intervals (<1s), thus resulting
 *    in this computation here being done everytime, causing more dropped frames
 */
export function usePortfolio(
  accounts?: AccountLike[],
  options?: GetPortfolioOptionsType,
) {
  const to = useSelector(counterValueCurrencySelector);
  const accountsSelected = useSelector(accountsSelector);
  const range = useSelector(selectedTimeRangeSelector);
  return usePortfolioCommon({
    accounts: accounts || accountsSelected,
    range,
    to,
    options,
  });
}

export function useCurrencyPortfolio({
  currency,
  range,
}: {
  currency: CryptoCurrency | TokenCurrency;
  range: PortfolioRange;
}) {
  const accounts = useSelector(accountsSelector);
  const to = useSelector(counterValueCurrencySelector);
  return useCurrencyPortfolioCommon({
    accounts,
    range,
    to,
    currency,
  });
}
