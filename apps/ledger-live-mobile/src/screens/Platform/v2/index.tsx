import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppManifest } from "@ledgerhq/live-common/platform/types";
import TrackScreen from "../../../analytics/TrackScreen";
import AppCard from "./AppCard";
import { TAB_BAR_SAFE_HEIGHT } from "../../../components/TabBar/shared";
import TabBarSafeAreaView from "../../../components/TabBar/TabBarSafeAreaView";
import { useCategories, useDisclaimer, useDeeplinkEffect } from "./shared";
import AnimatedHeaderViewV2 from "../../../components/AnimatedHeaderV2";
import DAppDisclaimer from "./DAppDisclaimer";

export default function PlatformCatalogV2() {
  const { t } = useTranslation();

  const { manifests, categories, manifestsByCategory, setCategory } =
    useCategories();
  const {
    name,
    icon,
    isOpened,
    isChecked,
    isDismissed,
    isReadOnly,
    onClose,
    onContinue,
    openApp,
    toggleCheck,
    prompt,
  } = useDisclaimer();

  useDeeplinkEffect(manifests, openApp);

  const onSelect = useCallback(
    (manifest: AppManifest) => {
      if (!isDismissed && !isReadOnly) {
        prompt(manifest);
      } else {
        openApp(manifest);
      }
    },
    [isDismissed, isReadOnly, openApp, prompt],
  );

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
        <DAppDisclaimer
          name={name}
          icon={icon}
          isOpened={isOpened}
          onClose={onClose}
          isChecked={isChecked}
          toggleCheck={toggleCheck}
          onContinue={onContinue}
        />

        {manifestsByCategory.map(manifest => (
          <AppCard
            key={`${manifest.id}.${manifest.branch}`}
            manifest={manifest}
            onPress={onSelect}
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
