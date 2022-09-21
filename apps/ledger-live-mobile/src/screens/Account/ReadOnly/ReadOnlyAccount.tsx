import React, { useCallback, useMemo, useContext } from "react";
import { FlatList } from "react-native";
import { useSelector } from "react-redux";
import { Trans, useTranslation } from "react-i18next";
import { Box, Flex, Text } from "@ledgerhq/native-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCryptoCurrencyById,
  getTokenById,
} from "@ledgerhq/live-common/currencies/index";
import { Currency } from "@ledgerhq/types-cryptoassets";
import { useFocusEffect } from "@react-navigation/native";

import { TAB_BAR_SAFE_HEIGHT } from "../../../components/TabBar/TabBarSafeAreaView";
import ReadOnlyGraphCard from "../../../components/ReadOnlyGraphCard";
import ReadOnlyFabActions from "../../../components/FabActions/ReadOnlyFabActions";
import GradientContainer from "../../../components/GradientContainer";
import BuyDeviceBanner, {
  IMAGE_PROPS_BIG_NANO,
} from "../../../components/BuyDeviceBanner";
import SetupDeviceBanner from "../../../components/SetupDeviceBanner";
import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
import { TrackScreen } from "../../../analytics";

import { withDiscreetMode } from "../../../context/DiscreetModeContext";
import {
  counterValueCurrencySelector,
  hasOrderedNanoSelector,
} from "../../../reducers/settings";
// eslint-disable-next-line import/no-cycle
import { AnalyticsContext } from "../../../components/RootNavigator";

type RouteParams = {
  currencyId: string;
  currencyType: "CryptoCurrency" | "TokenCurrency";
};

type Props = {
  navigation: any;
  route: { params: RouteParams };
};

function ReadOnlyAccount({ route }: Props) {
  const { currencyId, currencyType } = route.params;

  const currency: Currency = useMemo(
    () =>
      currencyType === "CryptoCurrency"
        ? getCryptoCurrencyById(currencyId)
        : getTokenById(currencyId),
    [currencyType, currencyId],
  );
  const { t } = useTranslation();

  const counterValueCurrency: Currency = useSelector(
    counterValueCurrencySelector,
  );

  const hasOrderedNano = useSelector(hasOrderedNanoSelector);

  const data = [
    <Box mx={6} my={6}>
      <ReadOnlyGraphCard
        counterValueCurrency={counterValueCurrency}
        headerText={
          <CurrencyUnitValue
            unit={currency.units[0]}
            value={0}
            joinFragmentsSeparator=" "
          />
        }
      />
    </Box>,
    <Box py={3}>
      <ReadOnlyFabActions />
    </Box>,
    <Box mt={8}>
      <GradientContainer containerStyle={{ marginHorizontal: 16 }}>
        <Flex
          flex={1}
          px={10}
          py={11}
          alignItems="center"
          justifyContent="center"
        >
          <Text
            variant="large"
            fontWeight="semiBold"
            color="neutral.c100"
            textAlign="center"
          >
            {t("account.readOnly.noTransaction.title")}
          </Text>
          <Text
            variant="small"
            fontWeight="medium"
            color="neutral.c70"
            textAlign="center"
            mt={3}
          >
            <Trans
              i18nKey={"account.readOnly.noTransaction.subtitle"}
              values={{ assetName: currency.name }}
            />
          </Text>
        </Flex>
      </GradientContainer>
    </Box>,
    <Box mt={8} mx={6}>
      {hasOrderedNano ? (
        <SetupDeviceBanner screen="Assets" />
      ) : (
        <BuyDeviceBanner
          style={{
            marginTop: 40,
            paddingTop: 13.5,
            paddingBottom: 13.5,
          }}
          buttonLabel={t("buyDevice.bannerButtonTitle")}
          buttonSize="small"
          event="button_clicked"
          eventProperties={{
            button: "Discover the Nano",
            screen: "Account",
            currency: currency.name,
          }}
          screen="Account"
          {...IMAGE_PROPS_BIG_NANO}
        />
      )}
    </Box>,
  ];

  const renderItem = useCallback(({ item }: any) => item, []);
  const keyExtractor = useCallback((_: any, index: any) => String(index), []);

  const { source, setSource, setScreen } = useContext(AnalyticsContext);

  useFocusEffect(
    useCallback(() => {
      setScreen("Account");

      return () => {
        setSource("Account");
      };
    }, [setSource, setScreen]),
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <TrackScreen
        category="Account"
        currency={currency.name}
        operationsSize={0}
        source={source}
      />
      <FlatList
        contentContainerStyle={{ paddingBottom: TAB_BAR_SAFE_HEIGHT }}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

export default withDiscreetMode(ReadOnlyAccount);
