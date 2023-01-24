import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { TextInput } from "react-native";
import Fuse from "fuse.js";
import { useDebounce } from "@ledgerhq/live-common/hooks/useDebounce";
import { ScreenName } from "../../../const";
import { useBanner } from "../../../components/banners/hooks";
import { readOnlyModeEnabledSelector } from "../../../reducers/settings";
import { NavigationProps } from "./types";

const defaultArray: LiveAppManifest[] = [];

export function useCategories() {
  const manifests = useFilteredManifests();
  const { categories, manifestsByCategories } = useCategoriesRaw(manifests);
  const [selected, setSelected] = useState("all");

  return {
    manifests,
    categories,
    manifestsByCategories,
    selected,
    setSelected,
  };
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

function useCategoriesRaw(manifests: AppManifest[]): {
  categories: string[];
  manifestsByCategories: Map<string, AppManifest[]>;
} {
  const manifestsByCategories = useMemo(() => {
    const res = manifests.reduce((res, m) => {
      m.categories.forEach(c => {
        const list = res.has(c) ? [...res.get(c), m] : [m];
        res.set(c, list);
      });

      return res;
    }, new Map().set("all", manifests));

    return res;
  }, [manifests]);

  const categories = useMemo(
    () => [...manifestsByCategories.keys()],
    [manifestsByCategories],
  );

  return {
    categories,
    manifestsByCategories,
  };
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

// TODO: Move somewhere more appropriate
export function useSearch<Item>({
  list,
  defaultInput = "",
  options,
}: {
  list: Item[];
  defaultInput?: string;
  options: Fuse.IFuseOptions<Item>;
}) {
  const inputRef = useRef<TextInput>(null);
  const [isActive, setIsActive] = useState(false);

  const [input, setInput] = useState(defaultInput);
  const debouncedInput = useDebounce(input, 300);

  const [isSearching, setIsSearching] = useState(false);

  const [result, setResult] = useState(list);
  // TODO: what if list chanegs
  const fuse = useRef(new Fuse(list, options));

  useEffect(() => {
    if (debouncedInput) {
      setIsSearching(true);
      setResult(fuse.current.search(debouncedInput).map(res => res.item));
    } else {
      setResult([]);
      setIsSearching(false);
    }
  }, [debouncedInput]);

  const onFocus = useCallback(() => {
    setIsActive(true);
  }, []);

  const onCancel = useCallback(() => {
    setIsActive(false);
    inputRef.current?.blur();
  }, []);

  return {
    inputRef,
    input,
    result,
    isActive,
    isSearching,
    onChange: setInput,
    onFocus,
    onCancel,
  };
}
