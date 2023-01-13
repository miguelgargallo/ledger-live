// TODO : Working on

import React, { useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "styled-components/native";
import { ScreenName } from "../../const";
import { getStackNavigatorConfig } from "../../navigation/navigatorConfig";
import Discover from "../../screens/Discover";
import PlatformCatalog from "../../screens/Platform";
import isPlatformV2Enabled from "../../screens/PlatformV2/featureflag";
import PlatformCatalogV2 from "../../screens/PlatformV2";
import { DiscoverNavigatorStackParamList } from "./types/DiscoverNavigator";

export default function DiscoverNavigator() {
  const { colors } = useTheme();
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );

  if (isPlatformV2Enabled) console.warn("PlatformV2 is enabled");

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
        component={isPlatformV2Enabled ? PlatformCatalogV2 : PlatformCatalog}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator<DiscoverNavigatorStackParamList>();
