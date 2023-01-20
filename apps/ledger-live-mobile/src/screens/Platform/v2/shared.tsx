import { useState, useMemo, useEffect, useCallback } from "react";
import useEnv from "@ledgerhq/live-common/hooks/useEnv";
import { useRemoteLiveAppContext } from "@ledgerhq/live-common/platform/providers/RemoteLiveAppProvider/index";
import {
  FilterParams,
  filterPlatformApps,
} from "@ledgerhq/live-common/platform/filters";
import { getPlatformVersion } from "@ledgerhq/live-common/platform/version";
import { LiveAppManifest } from "@ledgerhq/live-common/platform/providers/types";
import { AppManifest } from "@ledgerhq/live-common/platform/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { ScreenName } from "../../../const";
import { useBanner } from "../../../components/banners/hooks";
import { readOnlyModeEnabledSelector } from "../../../reducers/settings";
import { NavigationProps } from "./types";

const defaultArray: LiveAppManifest[] = [];

export function useCategories() {
  const manifests = useFilteredManifests();
  const categories = useCategoriesRaw(manifests);
  const { res: manifestsByCategory, setCategory } =
    useManifestsByCategory(manifests);

  return { manifests, categories, manifestsByCategory, setCategory };
}

export function useFilteredManifests(filterParamsOverride?: FilterParams) {
  const { state } = useRemoteLiveAppContext();
  const manifests = state?.value?.liveAppByIndex || defaultArray;
  const experimental = useEnv("PLATFORM_EXPERIMENTAL_APPS");

  return useMemo(() => {
    const branches = [
      "stable",
      "soon",
      ...(experimental ? ["experimental"] : []),
    ];

    // TODO improve types, mismatch between LiveAppManifest & AppManifest
    return filterPlatformApps(Array.from(manifests.values()) as AppManifest[], {
      version: getPlatformVersion(),
      platform: "mobile",
      branches,
      ...(filterParamsOverride ?? {}),
    });
  }, [manifests, experimental, filterParamsOverride]);
}

function useCategoriesRaw(manifests: AppManifest[]) {
  return useMemo(() => {
    const res = manifests.reduce((res, manifest) => {
      manifest.categories.forEach(c => {
        res.add(c);
      });

      return res;
    }, new Set(["all"]));

    return Array.from(res);
  }, [manifests]);
}

function useManifestsByCategory(manifests: AppManifest[]) {
  const [category, setCategory] = useState("all");

  const res = useMemo(
    () =>
      category === "all"
        ? manifests
        : manifests.filter(m => m.categories.includes(category)),
    [category, manifests],
  );

  return { res, setCategory };
}

export function useDeeplinkEffect(
  manifests: AppManifest[],
  openApp: (manifest: AppManifest) => void,
) {
  const navigation = useNavigation<NavigationProps["navigation"]>();
  const route = useRoute<NavigationProps["route"]>();
  const { platform, ...params } = route.params ?? {};

  useEffect(() => {
    // platform can be predefined when coming from a deeplink
    if (platform && manifests) {
      const manifest = manifests.find(m => m.id === platform);

      if (!manifest) return;

      openApp(manifest);
    }
  }, [platform, manifests, navigation, params, openApp]);
}

const DAPP_DISCLAIMER_ID = "PlatformAppDisclaimer";

export function useDisclaimer() {
  const navigation = useNavigation<NavigationProps["navigation"]>();
  const route = useRoute<NavigationProps["route"]>();
  const { platform, ...params } = route.params ?? {};

  const isReadOnly = useSelector(readOnlyModeEnabledSelector);
  const [isDismissed, dismiss] = useBanner(DAPP_DISCLAIMER_ID);

  const [manifest, setManifest] = useState<AppManifest>();
  const [isChecked, setIsChecked] = useState(false);

  const openApp = useCallback(
    (manifest: AppManifest) => {
      navigation.navigate(ScreenName.PlatformApp, {
        ...params,
        platform: manifest.id,
        name: manifest.name,
      });
    },
    [navigation, params],
  );

  const close = useCallback(() => {
    setManifest(undefined);
  }, [setManifest]);

  const onContinue = useCallback(() => {
    if (!manifest) return;

    if (isChecked) {
      dismiss();
    }

    close();
    openApp(manifest);
  }, [close, dismiss, isChecked, openApp, manifest]);

  const toggleCheck = useCallback(() => {
    setIsChecked(isDisabled => !isDisabled);
  }, [setIsChecked]);

  return {
    name: manifest?.name,
    icon: manifest?.icon,
    isOpened: !!manifest,
    isChecked,
    isDismissed,
    isReadOnly,
    onClose: close,
    onContinue,
    openApp,
    close,
    toggleCheck,
    prompt: setManifest,
  };
}
