import { useState, useMemo } from "react";
import useEnv from "@ledgerhq/live-common/hooks/useEnv";
import { useRemoteLiveAppContext } from "@ledgerhq/live-common/platform/providers/RemoteLiveAppProvider/index";
import {
  FilterParams,
  filterPlatformApps,
} from "@ledgerhq/live-common/platform/filters";
import { getPlatformVersion } from "@ledgerhq/live-common/platform/version";
import type { LiveAppManifest } from "@ledgerhq/live-common/platform/providers/types";
import type { AppManifest } from "@ledgerhq/live-common/platform/types";

const defaultArray: LiveAppManifest[] = [];

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

export function useCategories(manifests: AppManifest[]) {
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

export function useManifestsByCategory(manifests: AppManifest[]) {
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
