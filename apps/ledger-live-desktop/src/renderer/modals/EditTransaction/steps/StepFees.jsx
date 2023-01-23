// @flow

import React, { Fragment, PureComponent } from "react";
import { Trans } from "react-i18next";
import { getMainAccount } from "@ledgerhq/live-common/account/index";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import CurrencyDownStatusAlert from "~/renderer/components/CurrencyDownStatusAlert";
import ErrorBanner from "~/renderer/components/ErrorBanner";
import BuyButton from "~/renderer/components/BuyButton";
import Alert from "~/renderer/components/Alert";
import AccountFooter from "../AccountFooter";
import SendAmountFields from "../SendAmountFields";
import type { StepProps } from "../types";

const StepFees = (props: StepProps) => {
  const {
    t,
    account,
    parentAccount,
    transaction,
    onChangeTransaction,
    error,
    status,
    bridgePending,
    updateTransaction,
  } = props;

  if (!status) return null;
  const mainAccount = account ? getMainAccount(account, parentAccount) : null;

  return (
    <Box flow={4}>
      {mainAccount ? <CurrencyDownStatusAlert currencies={[mainAccount.currency]} /> : null}
      {error ? <ErrorBanner error={error} /> : null}
      {account && transaction && mainAccount && (
        <Fragment key={account.id}>
          <SendAmountFields
            account={mainAccount}
            status={status}
            transaction={transaction}
            onChange={onChangeTransaction}
            bridgePending={bridgePending}
            updateTransaction={updateTransaction}
          />
        </Fragment>
      )}
      <Alert type="primary">
        <div>{`${t("operation.edit.previousFeesInfo")} 0.1 ${mainAccount.currency.ticker}`}</div>
      </Alert>
    </Box>
  );
};

export class StepFeesFooter extends PureComponent<StepProps> {
  onNext = async () => {
    const { transitionTo } = this.props;
    transitionTo("summary");
  };

  render() {
    const { account, parentAccount, status, bridgePending, isNFTSend } = this.props;
    const { errors } = status;
    if (!account) return null;

    const mainAccount = getMainAccount(account, parentAccount);
    const isTerminated = mainAccount.currency.terminated;
    const hasErrors = Object.keys(errors).length;
    const canNext = !bridgePending && !hasErrors && !isTerminated;
    const {
      gasPrice: gasPriceError,
      maxPriorityFee: maxPriorityFeeError,
      maxFee: maxFeeError,
    } = errors;

    return (
      <>
        {!isNFTSend ? (
          <AccountFooter parentAccount={parentAccount} account={account} status={status} />
        ) : null}
        {gasPriceError || maxPriorityFeeError || maxFeeError ? (
          <BuyButton currency={mainAccount.currency} account={mainAccount} />
        ) : null}
        <Button
          id={"send-amount-continue-button"}
          isLoading={bridgePending}
          primary
          disabled={!canNext}
          onClick={this.onNext}
        >
          <Trans i18nKey="common.continue" />
        </Button>
      </>
    );
  }
}

export default StepFees;
