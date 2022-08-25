import type { EventBridgeHandler } from "aws-lambda";

import * as sqs from "./sqs";
import * as espn from "./espn";

const day = 1000 * 60 * 60 * 24 * 2;

export interface Detail {
  /** The polling interval in milliseconds. */
  interval: number;

  /** Epoch timestamp the polling started. */
  start: number;

  /** ID of Fantasy league to poll. */
  leagueId: string;

  /** An SWID used to authenticate with ESPN FF API. */
  swid: string;

  /** A token used to authenticate with ESPN FF API. */
  espnS2: string;
}

export const handler: EventBridgeHandler<"", Detail, void> = async ({
  detail,
}) => {
  const to = new Date();
  const from = new Date(to.getTime() - day);
  const isFirstRun = Date.now() - detail.start < detail.interval * 1.5;
  const after = isFirstRun ? from : new Date(Date.now() - detail.interval);

  const plays = await espn.getRelativePlays({
    ...detail,
    from,
    to,
    after,
  });
  if (plays.length) {
    await sqs.sendMessage({ ...detail, plays });
  }
};
