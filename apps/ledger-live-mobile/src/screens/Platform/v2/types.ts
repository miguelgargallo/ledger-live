import {
  BaseComposite,
  StackNavigatorProps,
} from "../../../components/RootNavigator/types/helpers";
import { DiscoverNavigatorStackParamList } from "../../../components/RootNavigator/types/DiscoverNavigator";
import { ScreenName } from "../../../const";

export type NavigationProps = BaseComposite<
  StackNavigatorProps<
    DiscoverNavigatorStackParamList,
    ScreenName.PlatformCatalog
  >
>;
