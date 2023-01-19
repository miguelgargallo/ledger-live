// TODO : Working on

import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { AppManifest } from "@ledgerhq/live-common/platform/types";
import { useSelector } from "react-redux";
import { useBanner } from "../../../components/banners/hooks";
import TrackScreen from "../../../analytics/TrackScreen";
import { ScreenName } from "../../../const";
// import type { Props as DisclaimerProps } from "./DAppDisclaimer";
import AppCard from "./AppCard";
import { TAB_BAR_SAFE_HEIGHT } from "../../../components/TabBar/shared";
import TabBarSafeAreaView from "../../../components/TabBar/TabBarSafeAreaView";
import { readOnlyModeEnabledSelector } from "../../../reducers/settings";
import {
  useFilteredManifests,
  useCategories,
  useManifestsByCategory,
} from "./shared";
import {
  BaseComposite,
  StackNavigatorProps,
} from "../../../components/RootNavigator/types/helpers";
import { DiscoverNavigatorStackParamList } from "../../../components/RootNavigator/types/DiscoverNavigator";
import AnimatedHeaderViewV2 from "../../../components/AnimatedHeaderV2";

type NavigationProps = BaseComposite<
  StackNavigatorProps<
    DiscoverNavigatorStackParamList,
    ScreenName.PlatformCatalog
  >
>;
/*
type DisclaimerOpts =
  | (DisclaimerProps & {
      isOpened: boolean;
    })
  | null;
  */
const DAPP_DISCLAIMER_ID = "PlatformAppDisclaimer";

export default function PlatformCatalogV2({ route }: NavigationProps) {
  const { platform, ...routeParams } = route.params ?? {};

  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProps["navigation"]>();
  const readOnlyModeEnabled = useSelector(readOnlyModeEnabledSelector);

  const manifests = useFilteredManifests();
  const categories = useCategories(manifests);
  const { res: manifestsByCategory, setCategory } =
    useManifestsByCategory(manifests);

  // Disclaimer State
  // const [disclaimerOpts, setDisclaimerOpts] = useState<DisclaimerOpts>(null);
  // const [disclaimerOpened, setDisclaimerOpened] = useState<boolean>(false);
  const [disclaimerDisabled, setDisclaimerDisabled] =
    useBanner(DAPP_DISCLAIMER_ID);
  const handlePressCard = useCallback(
    (manifest: AppManifest) => {
      const openDApp = () =>
        navigation.navigate(ScreenName.PlatformApp, {
          ...routeParams,
          platform: manifest.id,
          name: manifest.name,
        });

      /*      if (!disclaimerDisabled && !readOnlyModeEnabled) {
        setDisclaimerOpts({
          disableDisclaimer: () => {
            if (typeof setDisclaimerDisabled === "function")
              setDisclaimerDisabled();
          },
          closeDisclaimer: () => {
            setDisclaimerOpened(false);
          },
          icon: manifest.icon,
          name: manifest.name,
          onContinue: openDApp,
          isOpened: false,
        });
        setDisclaimerOpened(true);
      } else {
        openDApp();
      } */
      openDApp();
    },
    [
      navigation,
      routeParams,
      setDisclaimerDisabled,
      disclaimerDisabled,
      readOnlyModeEnabled,
    ],
  );
  useEffect(() => {
    // platform can be predefined when coming from a deeplink
    if (platform && manifests) {
      const manifest = manifests.find(m => m.id === platform);

      if (manifest) {
        navigation.navigate(ScreenName.PlatformApp, {
          ...routeParams,
          platform: manifest.id,
          name: manifest.name,
        });
      }
    }
  }, [platform, manifests, navigation, routeParams]);

  return (
    <TabBarSafeAreaView edges={["bottom", "left", "right"]}>
      <AnimatedHeaderViewV2
        titleStyle={styles.title}
        title={t("browseWeb3.catalog.title")}
        subtitle={t("browseWeb3.catalog.subtitle")}
        hasBackButton
        list={categories}
        listTitle={"Categories"}
        listElementAction={setCategory}
      >
        <TrackScreen category="Platform" name="Catalog" />

        {manifestsByCategory.map(manifest => (
          <AppCard
            key={`${manifest.id}.${manifest.branch}`}
            manifest={manifest}
            onPress={handlePressCard}
          />
        ))}
        <View style={styles.bottomPadding} />
      </AnimatedHeaderViewV2>
    </TabBarSafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    lineHeight: 40,
    textAlign: "left",
  },
  bottomPadding: {
    paddingBottom: TAB_BAR_SAFE_HEIGHT,
  },
});
