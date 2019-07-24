/* @flow */
import React, { PureComponent, Fragment } from "react";
import { View, StyleSheet } from "react-native";
import type { Account, TokenAccount } from "@ledgerhq/live-common/lib/types";
import {
  getAccountUnit,
  getAccountCurrency,
} from "@ledgerhq/live-common/lib/account";
import { Trans } from "react-i18next";
import SummaryRow from "./SummaryRow";
import CounterValue from "../../components/CounterValue";
import CurrencyUnitValue from "../../components/CurrencyUnitValue";
import LText from "../../components/LText";
import BottomModal from "../../components/BottomModal";
import ModalBottomAction from "../../components/ModalBottomAction";
import Button from "../../components/Button";
import Circle from "../../components/Circle";
import Touchable from "../../components/Touchable";
import Info from "../../icons/Info";

import colors from "../../colors";

type Props = {
  account: Account | TokenAccount,
  parentAccount: ?Account,
  amount: *,
};

type State = {
  isModalOpened: boolean,
};

class SummaryTotalSection extends PureComponent<Props, State> {
  state = {
    isModalOpened: false,
  };

  onRequestClose = () => {
    this.setState({ isModalOpened: false });
  };

  onPress = () => {
    this.setState({ isModalOpened: true });
  };

  render() {
    const { account, amount } = this.props;
    const { isModalOpened } = this.state;
    const unit = getAccountUnit(account);
    const currency = getAccountCurrency(account);
    return (
      <Fragment>
        <SummaryRow
          title={<Trans i18nKey="send.summary.total" />}
          additionalInfo={
            <Touchable onPress={this.onPress} event="SummaryTotalInfo">
              <Info size={12} color={colors.grey} />
            </Touchable>
          }
          titleProps={{ semiBold: true, style: styles.title }}
        >
          <View style={styles.summary}>
            <LText semiBold style={styles.summaryValueText}>
              <CurrencyUnitValue unit={unit} value={amount} disableRounding />
            </LText>
            <LText style={styles.summaryCounterValueText}>
              <CounterValue
                value={amount}
                currency={currency}
                showCode
                before="≈ "
              />
            </LText>
          </View>
        </SummaryRow>
        <BottomModal
          id="SummaryTotalModal"
          isOpened={isModalOpened}
          onClose={this.onRequestClose}
        >
          <ModalBottomAction
            title={<Trans i18nKey="send.summary.infoTotalTitle" />}
            icon={
              <Circle bg={colors.lightLive} size={56}>
                <Info size={16} color={colors.live} />
              </Circle>
            }
            description={<Trans i18nKey="send.summary.infoTotalDesc" />}
            footer={
              <View>
                <Button
                  event="SummaryTotalInfoClose"
                  type="primary"
                  title={<Trans i18nKey="common.close" />}
                  onPress={this.onRequestClose}
                />
              </View>
            }
          />
        </BottomModal>
      </Fragment>
    );
  }
}
const styles = StyleSheet.create({
  summary: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  title: {
    color: colors.darkBlue,
  },
  summaryValueText: {
    fontSize: 18,
  },
  summaryCounterValueText: {
    fontSize: 14,
    color: colors.grey,
  },
});

export default SummaryTotalSection;
