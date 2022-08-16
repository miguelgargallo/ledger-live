import React, { useCallback, useEffect } from "react";
import { NativeModules } from "react-native";
import { useTheme } from "styled-components/native";
import { StackScreenProps } from "@react-navigation/stack";
import {
  useBleDevicePairing,
  PairingError,
} from "@ledgerhq/live-common/ble/hooks/useBleDevicePairing";
import { ScannedDevice } from "@ledgerhq/live-common/ble/hooks/useBleDevicesScanning";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { useTranslation } from "react-i18next";
import { getDeviceModel } from "@ledgerhq/devices";
import { Flex, InfiniteLoader, Text } from "@ledgerhq/native-ui";
import { CircledCheckSolidMedium } from "@ledgerhq/native-ui/assets/icons";
import { SyncOnboardingStackParamList } from "../../components/RootNavigator/SyncOnboardingNavigator";
import { ScreenName } from "../../const";
import OnboardingView from "../Onboarding/OnboardingView";
import Illustration from "../../images/illustration/Illustration";
import RequiresBLE from "../../components/RequiresBLE";

const setupLedgerImg = require("../../images/illustration/Shared/_SetupLedger.png");

const TIMEOUT_AFTER_PAIRED_MS = 2000;

type Props = StackScreenProps<SyncOnboardingStackParamList, "BleDevicePairing">;

export const BleDevicePairing = ({ navigation, route }: Props) => {
  const { deviceToPair } = route.params;
  const { isPaired, pairingError } = useBleDevicePairing({
    deviceId: deviceToPair.deviceId,
  });

  useEffect(() => {
    if (isPaired) {
      setTimeout(() => {
        // Replace to avoid going back to this screen without re-rendering
        navigation.replace(
          ScreenName.SyncOnboardingCompanion as "SyncOnboardingCompanion",
          { device: deviceToPair },
        );
      }, TIMEOUT_AFTER_PAIRED_MS);
    }
  }, [isPaired, deviceToPair, navigation]);

  return (
    <RequiresBLE>
      <BleDevicePairingInner
        device={deviceToPair}
        isPaired={isPaired}
        pairingError={pairingError}
      />
    </RequiresBLE>
  );
};

const BleDevicePairingInner = ({
  device,
  isPaired,
  pairingError,
}: {
  device: Device;
  isPaired: boolean;
  pairingError: PairingError;
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const productName =
    getDeviceModel(device.modelId).productName || device.modelId;
  const deviceName = device.deviceName || productName;

  if (isPaired) {
    return (
      <OnboardingView>
        <Flex alignItems="center">
          <Flex
            alignItems="center"
            justifyContent="center"
            p={1}
            borderWidth={2}
            borderRadius="9999px"
            borderColor={colors.success.c80}
            mb={6}
          >
            <CircledCheckSolidMedium color={colors.success.c80} size={48} />
          </Flex>
          <Text mb={8} textAlign="center" variant="h4" fontWeight="semiBold">
            {t("syncOnboarding.pairing.success.title", {
              deviceName,
            })}
          </Text>
          <Illustration
            size={300}
            darkSource={setupLedgerImg}
            lightSource={setupLedgerImg}
          />
        </Flex>
      </OnboardingView>
    );
  }
  if (pairingError) {
    return (
      <OnboardingView
        hasCloseButton
        title={`❌ ${t("syncOnboarding.pairing.error.title")}`}
        subTitle={t("syncOnboarding.pairing.error.subtitle", { productName })}
      >
        <Illustration
          size={300}
          darkSource={setupLedgerImg}
          lightSource={setupLedgerImg}
        />
      </OnboardingView>
    );
  }

  return (
    <OnboardingView>
      <Flex alignItems="center">
        <Flex mb={6} p={1} borderWidth={2} borderColor="transparent">
          <InfiniteLoader size={48} />
        </Flex>
        <Text variant="h4" fontWeight="semiBold" textAlign="center" mb={4}>
          {t("syncOnboarding.pairing.loading.title", { deviceName })}
        </Text>
        <Text
          variant="body"
          fontWeight="medium"
          textAlign="center"
          mb={8}
          color="neutral.c80"
        >
          {t("syncOnboarding.pairing.loading.subtitle", { productName })}
        </Text>
        <Illustration
          size={300}
          darkSource={setupLedgerImg}
          lightSource={setupLedgerImg}
        />
      </Flex>
    </OnboardingView>
  );
};
