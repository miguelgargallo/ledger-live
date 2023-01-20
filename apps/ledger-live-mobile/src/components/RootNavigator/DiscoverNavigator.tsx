import React, { useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import useEnv from "@ledgerhq/live-common/hooks/useEnv";
import { useTheme } from "styled-components/native";
import { ScreenName } from "../../const";
import { getStackNavigatorConfig } from "../../navigation/navigatorConfig";
import Discover from "../../screens/Discover";
import PlatformCatalog from "../../screens/Platform";
import PlatformCatalogV2 from "../../screens/Platform/v2";
import { DiscoverNavigatorStackParamList } from "./types/DiscoverNavigator";

export default function DiscoverNavigator() {
  const { colors } = useTheme();
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );

  const version = useEnv("PLATFORM_DISCOVER_VERSION");

  const Catalog = useMemo(
    () => (version === 2 ? PlatformCatalogV2 : PlatformCatalog),
    [version],
  );

  return (
    <Stack.Navigator screenOptions={stackNavigationConfig}>
      <Stack.Screen
        name={ScreenName.DiscoverScreen}
        component={Discover}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.PlatformCatalog}
        component={Catalog}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator<DiscoverNavigatorStackParamList>();
