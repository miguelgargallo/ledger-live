import SelectAccountAndCurrencyDrawer from "~/renderer/drawers/DataSelector/SelectAccountAndCurrencyDrawer";
import { setDrawer } from "~/renderer/drawers/Provider";
import { useFeature } from "@ledgerhq/live-common/featureFlags/index";
import { Account } from "@ledgerhq/types-live";
import { useHistory } from "react-router-dom";
import { stakeDefaultTrack } from "./constants";
import { track, page } from "~/renderer/analytics/segment";

const useStakeFlow = () => {
  const history = useHistory();
  const stakeProgramsFeatureFlag = useFeature("stakePrograms");
  const { params: paramsFlag } = stakeProgramsFeatureFlag || {};
  const { list: listFlag } = paramsFlag || {};

  const getStakeDrawer = () => {
    page("Stake", "Drawer - Choose Asset", {
      page: history.location.pathname,
      ...stakeDefaultTrack,
    });
    setDrawer(
      SelectAccountAndCurrencyDrawer,
      {
        currencies: listFlag || [],
        onAccountSelected: (account: Account, parentAccount: Account | null = null) => {
          setDrawer();
          history.push({
            pathname: `/account/${account.id}`,
            state: {
              startStake: true,
            },
          });
          track("button_clicked", {
            button: "asset",
            page: history.location.pathname,
            currency: account?.currency?.family,
            account,
            parentAccount,
            ...stakeDefaultTrack,
          });
        },
      },
      {
        onRequestClose: () => {
          setDrawer();
          track("button_clicked", {
            button: "close",
            page: history.location.pathname,
            ...stakeDefaultTrack,
          });
        },
      },
    );
  };

  const getStakeFlow = () => {
    getStakeDrawer();
  };

  return getStakeFlow;
};

export default useStakeFlow;
