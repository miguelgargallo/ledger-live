// @flow
import "./env";
import axios from "axios";

import { listen as listenLogs } from "@ledgerhq/logs";
import logger from "./logger";

listenLogs(({ id, date, ...log }) => {
  if (log.type === "hid-frame") return;
  logger.debug(log);
});

if (process.env.NODE_ENV === "production") {
  const value = `lld/${__APP_VERSION__}`;
  setEnv("LEDGER_CLIENT_VERSION", value);
  // deprecated: move this logic in live-common (axios may be dropped in future)
  axios.defaults.headers.common["X-Ledger-Client-Version"] = value;
}
